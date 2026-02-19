import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { globalStyles, COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/styles';
import { Icon } from '../../components/Icon';
import { AttendanceService } from '../../services/attendance.service';

type AttendanceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AttendanceHistory'>; // Using generic or existing type

interface AttendanceScreenProps {
    navigation: AttendanceScreenNavigationProp;
    route: any; // To get params like "mode" (check-in/check-out)
}

const { width, height } = Dimensions.get('window');

export default function AttendanceScreen({ navigation, route }: AttendanceScreenProps) {
    const mode = route.params?.mode || 'check-in'; // 'check-in' | 'check-out'
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>('front');
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<any>(null);

    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        (async () => {
            // Request Location Permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError('Mất quyền truy cập vị trí');
                Alert.alert('Lỗi', 'Cần quyền truy cập vị trí để chấm công.');
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setLocation(location);
            } catch (error) {
                setLocationError('Không thể lấy vị trí');
                Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng kiểm tra GPS.');
            }
        })();
    }, []);

    if (!permission) {
        // Camera permissions are still loading.
        return <View style={globalStyles.container} />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={[globalStyles.container, styles.center]}>
                <Text style={{ color: '#fff', marginBottom: 20, textAlign: 'center' }}>
                    Cần quyền truy cập camera để chấm công khuôn mặt.
                </Text>
                <TouchableOpacity style={globalStyles.primaryButton} onPress={requestPermission}>
                    <Text style={globalStyles.primaryButtonText}>Cấp quyền Camera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleCaptureAndSubmit = async () => {
        if (!cameraRef.current || !location) {
            Alert.alert('Lỗi', 'Đang lấy dữ liệu vị trí hoặc camera chưa sẵn sàng.');
            return;
        }

        try {
            setIsProcessing(true);

            // 1. Capture Photo
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                base64: false,
            });
            setCapturedImage(photo);

            // 2. Submit to API
            const attendanceData = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy || 0,
                photo: photo, // Pass the photo object directly
                earlyCheckoutReason: mode === 'check-out' ? route.params?.reason : undefined, // Optional reason
            };

            if (mode === 'check-out') {
                await AttendanceService.checkOut(attendanceData);
                Alert.alert('Thành công', 'Check-out thành công!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                await AttendanceService.checkIn(attendanceData);
                Alert.alert('Thành công', 'Check-in thành công!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }

        } catch (error: any) {
            console.error('Attendance submit error:', error);
            Alert.alert('Lỗi', error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra khi chấm công.');
            setCapturedImage(null); // Reset on error to try again
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleCameraFacing = () => {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    };

    return (
        <View style={globalStyles.container}>
            {/* Header */}
            <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'transparent']}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    paddingTop: SPACING.xxl,
                    paddingHorizontal: SPACING.md,
                    paddingBottom: SPACING.xl,
                    zIndex: 10,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Icon name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={globalStyles.heading3}>
                        {mode === 'check-in' ? 'Chấm công vào' : 'Chấm công ra'}
                    </Text>
                    <TouchableOpacity onPress={toggleCameraFacing} style={styles.iconButton}>
                        <Icon name="cameraswitch" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Camera View */}
            <View style={styles.cameraContainer}>
                {capturedImage ? (
                    <Image source={{ uri: capturedImage.uri }} style={styles.camera} />
                ) : (
                    <CameraView
                        ref={cameraRef}
                        style={styles.camera}
                        facing={facing}
                    />
                )}

                {/* Face Guide Overlay */}
                {!capturedImage && (
                    <View style={styles.faceGuideContainer}>
                        <View style={styles.faceGuideBox} />
                        <Text style={styles.faceGuideText}>Đặt khuôn mặt vào khung hình</Text>
                    </View>
                )}
            </View>

            {/* Footer Info & Action */}
            <View style={styles.footer}>
                <View style={styles.locationInfo}>
                    <Icon name="location_on" size={20} color={COLORS.accent.cyan} />
                    <Text style={styles.locationText} numberOfLines={1}>
                        {location
                            ? `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`
                            : locationError || 'Đang lấy vị trí...'}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleCaptureAndSubmit}
                    disabled={isProcessing || !location}
                    style={[
                        styles.captureButton,
                        (isProcessing || !location) && { opacity: 0.7 }
                    ]}
                >
                    {isProcessing ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <View style={styles.captureInner}>
                            {/* Make icon larger and ensure it centers visually */}
                            <Icon name={mode === 'check-in' ? "face" : "logout"} size={32} color="#fff" />
                        </View>
                    )}
                </TouchableOpacity>

                <Text style={styles.actionText}>
                    {isProcessing ? 'Đang xử lý...' : `Nhấn để ${mode === 'check-in' ? 'Check-in' : 'Check-out'}`}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    cameraContainer: {
        flex: 1,
        position: 'relative',
    },
    camera: {
        flex: 1,
    },
    iconButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    faceGuideContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
        paddingBottom: 200, // Offset for footer
    },
    faceGuideBox: {
        width: width * 0.7,
        height: width * 0.7 * 1.3, // Aspect ratio roughly 3:4
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)', // Brighter border
        borderRadius: 24,
        backgroundColor: 'transparent',
    },
    faceGuideText: {
        position: 'absolute',
        top: -40, // Move text above the box
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: SPACING.xxl,
        paddingTop: SPACING.xl,
        backgroundColor: '#000',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        alignItems: 'center',
        zIndex: 20,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    locationText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 14,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 6,
        marginBottom: SPACING.sm,
    },
    captureInner: {
        flex: 1,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});
