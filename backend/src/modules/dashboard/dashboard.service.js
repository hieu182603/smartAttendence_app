import { UserModel } from "../users/user.model.js";
import { AttendanceModel } from "../attendance/attendance.model.js";
import { RequestModel } from "../requests/request.model.js";
import { NotificationModel } from "../notifications/notification.model.js";
import { DepartmentModel } from "../departments/department.model.js";
import { ReportModel } from "../reports/report.model.js";
import { LogModel } from "../logs/log.model.js";

export class DashboardService {
  /**
   * Lấy summary cho dashboard (shift, location, workingDays)
   */
  static async getDashboardSummary(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Lấy attendance hôm nay của user
      const todayAttendance = await AttendanceModel.findOne({
        userId,
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      }).populate("locationId");

      // Tính số ngày làm việc trong tháng
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);

      const monthAttendances = await AttendanceModel.find({
        userId,
        date: {
          $gte: monthStart,
          $lte: monthEnd,
        },
        status: { $in: ["present", "late"] },
      });

      const workingDays = {
        used: monthAttendances.length,
        total: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(), // Tổng số ngày trong tháng
      };

      return {
        shift: todayAttendance?.checkIn
          ? new Date(todayAttendance.checkIn).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
          : null,
        location: todayAttendance?.locationId?.name || null,
        workingDays,
      };
    } catch (error) {
      console.error("[DashboardService] getDashboardSummary error:", error);
      return {
        shift: null,
        location: null,
        workingDays: { used: 0, total: 0 },
      };
    }
  }

  /**
   * Lấy pending actions (pending requests, unread notifications)
   */
  static async getPendingActions(userId) {
    try {
      const user = await UserModel.findById(userId).select('role department');

      let pendingRequestsQuery = { status: "pending" };

      // For SUPERVISOR, get pending requests from their department employees that they can approve
      if (user.role === 'SUPERVISOR' && user.department) {
        const departmentUsers = await UserModel.find({
          department: user.department,
          role: { $in: ['EMPLOYEE', 'SUPERVISOR'] },
          isActive: true
        }).select('_id');
        const departmentUserIds = departmentUsers.map(u => u._id);
        pendingRequestsQuery.userId = { $in: departmentUserIds };
      } else {
        // For other roles, get their own pending requests
        pendingRequestsQuery.userId = userId;
      }

      // Đếm pending requests
      const pendingRequests = await RequestModel.countDocuments(pendingRequestsQuery);

      // Đếm unread notifications
      const unreadNotifications = await NotificationModel.countDocuments({
        userId,
        isRead: false,
      });

      return {
        hasPendingRequests: pendingRequests > 0,
        hasUnreadNotifications: unreadNotifications > 0,
        pendingRequestsCount: pendingRequests,
        unreadNotificationsCount: unreadNotifications,
      };
    } catch (error) {
      console.error("[DashboardService] getPendingActions error:", error);
      return {
        hasPendingRequests: false,
        hasUnreadNotifications: false,
        pendingRequestsCount: 0,
        unreadNotificationsCount: 0,
      };
    }
  }

  /**
   * Lấy thống kê tổng quan cho dashboard
   */
  static async getDashboardStats(departmentFilter = null) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 1. Tổng số nhân viên (chỉ tính active)
      const employeeQuery = { isActive: true };
      if (departmentFilter) {
        employeeQuery.department = departmentFilter;
      }
      const totalEmployees = await UserModel.countDocuments(employeeQuery);

      // 2. Lấy attendance hôm nay
      const todayAttendanceQuery = {
        date: {
          $gte: today,
          $lt: tomorrow,
        },
      };

      if (departmentFilter) {
        const departmentUsers = await UserModel.find({ department: departmentFilter, isActive: true }).select('_id');
        const userIds = departmentUsers.map(u => u._id);
        todayAttendanceQuery.userId = { $in: userIds };
      }

      const todayAttendance = await AttendanceModel.find(todayAttendanceQuery);

      // Tính toán stats hôm nay
      const presentToday = todayAttendance.filter((att) => att.status === "present").length;
      const lateToday = todayAttendance.filter((att) => att.status === "late").length;
      const leaveToday = todayAttendance.filter((att) => att.status === "on_leave").length;
      const absentToday = Math.max(0, totalEmployees - presentToday - lateToday - leaveToday);

      // 3. Online users count (from socket rooms)
      let onlineUsers = 0;
      try {
        const socketModule = await import("../../config/socket.js");
        const io = socketModule.getIO();
        const rooms = io.sockets.adapter.rooms;
        for (const room of rooms.keys()) {
          if (room.startsWith("user:")) {
            onlineUsers++;
          }
        }
      } catch (err) {
        onlineUsers = 0;
      }

      // 4. Pending requests count
      const pendingReqQuery = { status: "pending" };
      if (departmentFilter) {
        const departmentUsers = await UserModel.find({ department: departmentFilter, isActive: true }).select('_id');
        const userIds = departmentUsers.map(u => u._id);
        pendingReqQuery.userId = { $in: userIds };
      }
      const pendingRequests = await RequestModel.countDocuments(pendingReqQuery);

      // 5. Counts cho grid cards
      const totalDepartments = await DepartmentModel.countDocuments();
      const totalReports = await ReportModel.countDocuments();
      const totalLogs = await LogModel.countDocuments({
        createdAt: { $gte: today, $lt: tomorrow }
      });

      // 6. Hoạt động gần đây (Hoạt động trong 24h qua)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const logs = await LogModel.find({
        createdAt: { $gte: yesterday },
        action: { $in: ["checkin", "create_request", "approve_request"] }
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name avatar");

      const recentActivity = logs.map(log => ({
        id: log._id,
        userName: log.userId?.name || "System",
        userAvatar: log.userId?.avatar || null,
        type: log.action,
        description: log.action === "checkin" ? "Check-in hệ thống" :
          log.action === "create_request" ? "Gửi yêu cầu mới" : "Đã duyệt yêu cầu",
        time: log.createdAt,
      }));

      // 7. Lấy attendance tuần này (7 ngày gần nhất)
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - 6);

      const weekAttendanceQuery = {
        date: {
          $gte: weekStart,
          $lt: tomorrow,
        },
      };

      if (departmentFilter) {
        const departmentUsers = await UserModel.find({ department: departmentFilter, isActive: true }).select('_id');
        const userIds = departmentUsers.map(u => u._id);
        weekAttendanceQuery.userId = { $in: userIds };
      }

      const weekAttendance = await AttendanceModel.find(weekAttendanceQuery);

      // Nhóm theo ngày trong tuần
      const attendanceByDay = {};
      const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dayIndex = date.getDay();
        const dayName = dayNames[dayIndex];
        attendanceByDay[dayName] = {
          date: dayName,
          present: 0,
          late: 0,
          absent: 0,
        };
      }

      weekAttendance.forEach((att) => {
        const attDate = new Date(att.date);
        const dayIndex = attDate.getDay();
        const dayName = dayNames[dayIndex];

        if (att.status === "present") {
          attendanceByDay[dayName].present++;
        } else if (att.status === "late") {
          attendanceByDay[dayName].late++;
        }
      });

      Object.keys(attendanceByDay).forEach((day) => {
        const dayData = attendanceByDay[day];
        dayData.absent = Math.max(0, totalEmployees - dayData.present - dayData.late);
      });

      const attendanceData = [
        attendanceByDay["T2"], attendanceByDay["T3"], attendanceByDay["T4"],
        attendanceByDay["T5"], attendanceByDay["T6"], attendanceByDay["T7"],
        attendanceByDay["CN"],
      ];

      return {
        onlineUsers,
        pendingRequests,
        counts: {
          users: totalEmployees,
          departments: totalDepartments,
          reports: totalReports,
          logs: totalLogs,
        },
        attendanceToday: {
          present: presentToday,
          late: lateToday,
          absent: absentToday,
          leave: leaveToday,
        },
        recentActivity,
        attendanceData,
        kpi: {
          totalEmployees,
          presentToday,
          lateToday,
          absentToday,
        }
      };
    } catch (error) {
      console.error("[DashboardService] getDashboardStats error:", error);
      throw error;
    }
  }
}

