import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { AdminService } from '../../services/admin.service';

type AdminDepartmentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AdminDepartments'>;

interface AdminDepartmentsScreenProps {
    navigation: AdminDepartmentsScreenNavigationProp;
}

interface Department {
    _id: string;
    name: string;
    code: string;
    description: string;
    managerId?: { _id: string, name: string };
    branchId?: { _id: string, name: string };
}

interface User {
    _id: string;
    name: string;
}

interface Branch {
    _id: string;
    name: string;
}

export default function AdminDepartmentsScreen({ navigation }: AdminDepartmentsScreenProps) {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [managers, setManagers] = useState<User[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [selectedManagerId, setSelectedManagerId] = useState('');
    const [selectedBranchId, setSelectedBranchId] = useState('');

    // Selection Modals
    const [showManagerPicker, setShowManagerPicker] = useState(false);
    const [showBranchPicker, setShowBranchPicker] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [deptData, managerData, branchData] = await Promise.all([
                AdminService.getDepartments(),
                AdminService.getManagers(),
                AdminService.getBranches()
            ]);
            setDepartments(deptData);
            setManagers(managerData);
            setBranches(branchData);
        } catch (error) {
            console.error('Error loading data', error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (dept: Department) => {
        setEditingDept(dept);
        setName(dept.name);
        setCode(dept.code);
        setDescription(dept.description);
        setSelectedManagerId(dept.managerId?._id || '');
        setSelectedBranchId(dept.branchId?._id || '');
        setModalVisible(true);
    };

    const handleAdd = () => {
        setEditingDept(null);
        setName('');
        setCode('');
        setDescription('');
        setSelectedManagerId('');
        setSelectedBranchId(''); // Will be validated on save
        setModalVisible(true);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            'Xóa phòng ban',
            'Bạn có chắc chắn muốn xóa phòng ban này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AdminService.deleteDepartment(id);
                            loadData(); // Reload all to be safe
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete department. It might contain employees.');
                        }
                    }
                },
            ]
        );
    };

    const handleSave = async () => {
        if (!name.trim() || !code.trim()) {
            Alert.alert('Error', 'Tên và Mã phòng ban là bắt buộc');
            return;
        }
        if (!selectedBranchId) {
            Alert.alert('Error', 'Vui lòng chọn chi nhánh');
            return;
        }

        try {
            const data = {
                name,
                code,
                description,
                managerId: selectedManagerId || undefined,
                branchId: selectedBranchId
            };

            if (editingDept) {
                await AdminService.updateDepartment(editingDept._id, data);
            } else {
                await AdminService.createDepartment(data);
            }
            setModalVisible(false);
            loadData();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save department');
        }
    };

    const renderItem = ({ item }: { item: Department }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={{ color: COLORS.accent.cyan, fontWeight: 'bold' }}>{item.code}</Text>
                </View>
                <Text style={styles.cardSubtitle}>{item.description}</Text>
                <View style={{ marginTop: SPACING.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="person" size={14} color={COLORS.text.secondary} />
                        <Text style={{ color: COLORS.text.secondary, fontSize: 12, marginLeft: SPACING.xs }}>
                            Trưởng phòng: {item.managerId?.name || 'Chưa có'}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                        <Icon name="business" size={14} color={COLORS.text.secondary} />
                        <Text style={{ color: COLORS.text.secondary, fontSize: 12, marginLeft: SPACING.xs }}>
                            Chi nhánh: {item.branchId?.name || 'N/A'}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                    <Icon name="edit" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionButton}>
                    <Icon name="delete" size={20} color={COLORS.accent.red} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const getManagerName = (id: string) => managers.find(m => m._id === id)?.name || 'Chọn Trưởng phòng';
    const getBranchName = (id: string) => branches.find(b => b._id === id)?.name || 'Chọn Chi nhánh';

    return (
        <View style={globalStyles.container}>
            {/* Header */}
            <LinearGradient
                colors={[COLORS.primary, COLORS.accent.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: SPACING.xs }}>
                            <Icon name="arrow_back" size={24} color="#ffffff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Quản lý Phòng ban</Text>
                    </View>
                    <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
                        <Icon name="add" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <FlatList
                data={departments}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={{ padding: SPACING.md }}
                refreshing={isLoading}
                onRefresh={loadData}
                ListEmptyComponent={
                    <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
                        <Text style={{ color: COLORS.text.secondary }}>Chưa có phòng ban nào</Text>
                    </View>
                }
            />

            {/* Main Edit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>
                                {editingDept ? 'Sửa Phòng Ban' : 'Thêm Phòng Ban'}
                            </Text>

                            <Text style={styles.label}>Tên phòng ban <Text style={{ color: COLORS.accent.red }}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Nhập tên phòng ban"
                                placeholderTextColor={COLORS.text.secondary}
                            />

                            <Text style={styles.label}>Mã phòng ban <Text style={{ color: COLORS.accent.red }}>*</Text></Text>
                            <TextInput
                                style={styles.input}
                                value={code}
                                onChangeText={setCode}
                                placeholder="VD: IT, HR, MK"
                                placeholderTextColor={COLORS.text.secondary}
                                autoCapitalize="characters"
                            />

                            <Text style={styles.label}>Mô tả</Text>
                            <TextInput
                                style={styles.input}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Nhập mô tả"
                                placeholderTextColor={COLORS.text.secondary}
                            />

                            <Text style={styles.label}>Chi nhánh <Text style={{ color: COLORS.accent.red }}>*</Text></Text>
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => setShowBranchPicker(true)}
                            >
                                <Text style={{ color: selectedBranchId ? '#fff' : COLORS.text.secondary }}>
                                    {getBranchName(selectedBranchId)}
                                </Text>
                                <Icon name="arrow_drop_down" size={24} color={COLORS.text.secondary} />
                            </TouchableOpacity>

                            <Text style={styles.label}>Trưởng phòng</Text>
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => setShowManagerPicker(true)}
                            >
                                <Text style={{ color: selectedManagerId ? '#fff' : COLORS.text.secondary }}>
                                    {getManagerName(selectedManagerId)}
                                </Text>
                                <Icon name="arrow_drop_down" size={24} color={COLORS.text.secondary} />
                            </TouchableOpacity>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: COLORS.surface.light }]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={{ color: COLORS.text.primary }}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
                                    onPress={handleSave}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Lưu</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Selection Picker Modal (Reusable-ish) */}
            <Modal
                transparent={true}
                visible={showManagerPicker || showBranchPicker}
                animationType="fade"
                onRequestClose={() => {
                    setShowManagerPicker(false);
                    setShowBranchPicker(false);
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {showManagerPicker ? 'Chọn Trưởng phòng' : 'Chọn Chi nhánh'}
                        </Text>
                        <FlatList
                            data={showManagerPicker ? managers : branches}
                            keyExtractor={item => item._id}
                            style={{ maxHeight: 300 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.pickerItem}
                                    onPress={() => {
                                        if (showManagerPicker) setSelectedManagerId(item._id);
                                        else setSelectedBranchId(item._id);
                                        setShowManagerPicker(false);
                                        setShowBranchPicker(false);
                                    }}
                                >
                                    <Text style={{ color: '#fff' }}>{item.name}</Text>
                                    {(showManagerPicker ? selectedManagerId : selectedBranchId) === item._id && (
                                        <Icon name="check" size={20} color={COLORS.accent.green} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={[styles.modalButton, { backgroundColor: COLORS.surface.light, marginTop: SPACING.md, alignSelf: 'center' }]}
                            onPress={() => {
                                setShowManagerPicker(false);
                                setShowBranchPicker(false);
                            }}
                        >
                            <Text style={{ color: COLORS.text.primary }}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: SPACING.xxl * 1.5,
        paddingBottom: SPACING.xl,
        paddingHorizontal: SPACING.md,
    },
    headerTitle: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: SPACING.sm,
    },
    addButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
    },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    cardTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    cardSubtitle: {
        color: COLORS.text.secondary,
        fontSize: 12,
    },
    actionButton: {
        padding: SPACING.sm,
        marginLeft: SPACING.xs,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: SPACING.lg,
    },
    modalContent: {
        backgroundColor: COLORS.surface.dark,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        maxHeight: '80%'
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    label: {
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
        marginTop: SPACING.md,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        color: '#fff',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    selectButton: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: SPACING.xl,
    },
    modalButton: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        marginLeft: SPACING.md,
    },
    pickerItem: {
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
});
