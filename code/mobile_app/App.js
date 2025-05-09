import React, { useState, createContext, useContext, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList, Switch, Alert, Vibration
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// --- CONTEXT FOR GLOBAL STATE ---
const AppContext = createContext();
const useAppContext = () => useContext(AppContext);

// --- ICON MOCK ---
const Icon = ({ name, size, color }) => (
    <Text style={{ color, fontSize: size }}>
        {name === 'view-dashboard' ? '📊' :
            name === 'qrcode-scan' ? '📷' :
                name === 'format-list-checks' ? '📋' :
                    name === 'bell' ? '🔔' :
                        name === 'account-settings' ? '⚙️' :
                            name === 'account-circle' ? '👤' :
                                name === 'help-circle' ? '❓' :
                                    name === 'headset' ? '🎧' :
                                        name === 'information' ? 'ℹ️' :
                                            name === 'truck' ? '🚚' :
                                                name === 'package' ? '📦' :
                                                    name === 'clock' ? '⏰' :
                                                        name === 'check-circle' ? '✅' :
                                                            name === 'flashlight' ? '🔦' : ''}
    </Text>
);

// --- QR SCANNER MOCK ---
const QRCodeScanner = ({ onRead, topContent, bottomContent }) => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {topContent}
        <View style={{ marginVertical: 20 }}>
            <Text style={{ textAlign: 'center', marginBottom: 20, color: '#666' }}>For demo purposes, select a vehicle to scan:</Text>
            <TouchableOpacity
                style={{
                    width: 200, height: 50, borderWidth: 2, borderColor: '#4DA6FF',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderRadius: 8
                }}
                onPress={() => {
                    Vibration.vibrate(100);
                    onRead({ data: 'TN-01-AB-1234' });
                }}
            >
                <Text style={{ color: '#4DA6FF' }}>Scan TN-01-AB-1234</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={{
                    width: 200, height: 50, borderWidth: 2, borderColor: '#4DA6FF',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderRadius: 8
                }}
                onPress={() => {
                    Vibration.vibrate(100);
                    onRead({ data: 'TN-01-CD-5678' });
                }}
            >
                <Text style={{ color: '#4DA6FF' }}>Scan TN-01-CD-5678</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={{
                    width: 200, height: 50, borderWidth: 2, borderColor: '#4DA6FF',
                    alignItems: 'center', justifyContent: 'center', borderRadius: 8
                }}
                onPress={() => {
                    Vibration.vibrate(100);
                    onRead({ data: 'TN-01-EF-9012' });
                }}
            >
                <Text style={{ color: '#4DA6FF' }}>Scan TN-01-EF-9012</Text>
            </TouchableOpacity>
        </View>
        {bottomContent}
    </View>
);

// --- LOGIN SCREEN ---
const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleLogin = () => navigation.replace('MainTabs');
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Text style={styles.logoText}>Track Master</Text>
            </View>
            <View style={styles.formContainer}>
                <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// --- TASKS DATA ---
const TASKS = [
    { id: '1', vehicle: 'TN-01-AB-1234', status: 'pending', destination: 'Distribution Center B', dueDate: 'May 10, 2025' },
    { id: '2', vehicle: 'TN-01-CD-5678', status: 'pending', destination: 'Retail Store C', dueDate: 'May 11, 2025' },
    { id: '3', vehicle: 'TN-01-EF-9012', status: 'pending', destination: 'Warehouse D', dueDate: 'May 12, 2025' },
];

// --- DASHBOARD SCREEN ---
const DashboardScreen = ({ navigation }) => {
    const { scannedVehicle, removeVehicle, completedTasks } = useAppContext();

    // Count pending and completed tasks
    const pendingCount = TASKS.filter(task => !completedTasks.includes(task.id)).length;
    const completedCount = completedTasks.length;

    // Get current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <View style={styles.dashboardContainer}>
            <View style={styles.dashboardHeader}>
                <Text style={styles.welcomeText}>Welcome, John Driver</Text>
                <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{pendingCount}</Text>
                    <Text style={styles.statLabel}>Pending Tasks</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{completedCount}</Text>
                    <Text style={styles.statLabel}>Completed Tasks</Text>
                </View>
            </View>
            <Text style={styles.sectionTitle}>Current Vehicle</Text>
            <View style={styles.vehicleInfoBox}>
                <Text style={styles.vehicleInfoText}>{scannedVehicle || 'No vehicle scanned'}</Text>
            </View>
            <TouchableOpacity
                style={styles.scanButton}
                onPress={() => navigation.navigate('Scan QR')}
            >
                <Text style={styles.scanButtonText}>
                    {scannedVehicle ? 'Change Vehicle (Scan New QR)' : 'Scan Vehicle QR Code'}
                </Text>
            </TouchableOpacity>
            {scannedVehicle && (
                <TouchableOpacity
                    style={[styles.scanButton, { backgroundColor: '#FF6B6B', marginTop: 10 }]}
                    onPress={removeVehicle}
                >
                    <Text style={styles.scanButtonText}>Remove Current Vehicle</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// --- QR SCANNER SCREEN ---
const QRScannerScreen = ({ navigation, route }) => {
    const { setScannedVehicle } = useAppContext();
    const { requiredVehicle } = route.params || {};

    const onSuccess = e => {
        const vehicleNumber = e.data;

        // If a specific vehicle is required, check if the scanned QR matches
        if (requiredVehicle && vehicleNumber !== requiredVehicle) {
            Alert.alert(
                "Wrong Vehicle",
                `You scanned ${vehicleNumber}, but you need to scan ${requiredVehicle} for this task.`,
                [{ text: "Try Again" }]
            );
            return;
        }

        setScannedVehicle(vehicleNumber);
        Vibration.vibrate(100);

        Alert.alert(
            "Vehicle Scanned",
            `Vehicle Number: ${vehicleNumber}`,
            [{ text: "OK", onPress: () => navigation.goBack() }]
        );
    };

    return (
        <View style={styles.container}>
            {requiredVehicle && (
                <View style={styles.requiredVehicleContainer}>
                    <Text style={styles.requiredVehicleText}>
                        Please scan vehicle: <Text style={styles.requiredVehicleNumber}>{requiredVehicle}</Text>
                    </Text>
                </View>
            )}

            <QRCodeScanner
                onRead={onSuccess}
                topContent={
                    <Text style={styles.centerText}>
                        {requiredVehicle
                            ? `Scan the QR code for vehicle ${requiredVehicle}`
                            : 'Scan any vehicle QR code to begin'}
                    </Text>
                }
                bottomContent={
                    <TouchableOpacity style={styles.buttonTouchable}>
                        <Text style={styles.buttonText}>Position QR code in the frame</Text>
                    </TouchableOpacity>
                }
            />
        </View>
    );
};

// --- TASK LIST SCREEN ---
const TaskScreen = ({ navigation }) => {
    const { completedTasks } = useAppContext();

    const renderItem = ({ item }) => {
        const isCompleted = completedTasks.includes(item.id);

        return (
            <TouchableOpacity
                style={[styles.taskItem, isCompleted ? styles.completedTask : null]}
                onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
            >
                <View style={styles.taskHeader}>
                    <Text style={styles.vehicleText}>Vehicle: {item.vehicle}</Text>
                    <Text style={[
                        styles.statusBadge,
                        isCompleted ? styles.completedBadge : styles.pendingBadge
                    ]}>
                        {isCompleted ? 'Completed' : 'Pending'}
                    </Text>
                </View>
                <View style={styles.taskDetails}>
                    <Text style={styles.destinationText}>To: {item.destination}</Text>
                    <Text style={styles.dateText}>Due: {item.dueDate}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Your Delivery Tasks</Text>
            <Text style={styles.taskInstructions}>
                Select a task to view details. You must scan the correct vehicle QR code before starting each task.
            </Text>
            <FlatList
                data={TASKS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

// --- TASK DETAILS SCREEN ---
const TaskDetailsScreen = ({ route, navigation }) => {
    const { taskId } = route.params;
    const { scannedVehicle, completedTasks, setCompletedTasks } = useAppContext();
    const task = TASKS.find(t => t.id === taskId);
    const [status, setStatus] = useState(completedTasks.includes(task.id) ? 'finished' : 'pending');

    // Check if the correct vehicle is scanned
    const hasCorrectVehicle = scannedVehicle === task.vehicle;

    const handleStart = () => {
        Alert.alert(
            'Start Task',
            `Are you sure you are in vehicle ${task.vehicle} and want to start this task?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Start',
                    onPress: () => {
                        Alert.alert(
                            'Double Confirm',
                            'Please confirm again to start the task.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Start',
                                    onPress: () => setStatus('started')
                                }
                            ]
                        );
                    }
                }
            ]
        );
    };

    const handleFinish = () => {
        Alert.alert(
            'Finish Task',
            `Are you sure you have completed the delivery for vehicle ${task.vehicle}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Finish',
                    onPress: () => {
                        Alert.alert(
                            'Double Confirm',
                            'Please confirm again to finish the task.',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Finish',
                                    onPress: () => {
                                        setStatus('finished');
                                        setCompletedTasks(prev => [...prev, task.id]);
                                    }
                                }
                            ]
                        );
                    }
                }
            ]
        );
    };

    // If wrong vehicle is scanned, prompt to scan correct one
    if (!hasCorrectVehicle) {
        return (
            <View style={styles.container}>
                <View style={styles.wrongVehicleContainer}>
                    <Text style={styles.wrongVehicleTitle}>Wrong Vehicle</Text>
                    <Text style={styles.wrongVehicleText}>
                        This task requires vehicle: <Text style={styles.requiredVehicleNumber}>{task.vehicle}</Text>
                    </Text>
                    {scannedVehicle && (
                        <Text style={styles.currentVehicleText}>
                            Currently scanned: <Text style={{fontWeight: 'bold'}}>{scannedVehicle}</Text>
                        </Text>
                    )}
                    <TouchableOpacity
                        style={styles.scanButton}
                        onPress={() => navigation.navigate('Scan QR', { requiredVehicle: task.vehicle })}
                    >
                        <Text style={styles.scanButtonText}>Scan {task.vehicle} QR Code</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.vehicleNumber}>Vehicle: {task.vehicle}</Text>
                <Text style={styles.statusText}>
                    Status: {status === 'pending' ? 'Ready to Start' :
                    status === 'started' ? 'In Progress' : 'Completed'}
                </Text>
            </View>
            <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Cargo Details</Text>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Cargo Type:</Text><Text style={styles.detailValue}>Electronics</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Weight:</Text><Text style={styles.detailValue}>2500 kg</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Pickup:</Text><Text style={styles.detailValue}>Warehouse A, 123 Main St</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Delivery:</Text><Text style={styles.detailValue}>{task.destination}</Text></View>
                <View style={styles.detailRow}><Text style={styles.detailLabel}>Expected Delivery:</Text><Text style={styles.detailValue}>{task.dueDate}</Text></View>
            </View>
            <View style={styles.actionContainer}>
                {status === 'pending' && (
                    <TouchableOpacity style={styles.actionButton} onPress={handleStart}>
                        <Text style={styles.actionButtonText}>Start Delivery</Text>
                    </TouchableOpacity>
                )}
                {status === 'started' && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} onPress={handleFinish}>
                        <Text style={styles.actionButtonText}>Finish Delivery</Text>
                    </TouchableOpacity>
                )}
                {status === 'finished' && (
                    <View style={styles.completionContainer}>
                        <Text style={styles.completionText}>Delivery completed successfully!</Text>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: '#4DA6FF' }]}
                            onPress={() => navigation.navigate('To-Do')}
                        >
                            <Text style={styles.actionButtonText}>Return to Tasks</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

// --- NOTIFICATIONS SCREEN ---
const NotificationsScreen = () => {
    const notifications = [
        { id: '1', title: 'New Delivery Assigned', message: 'You have been assigned a new delivery task for vehicle TN-01-GH-3456.', time: '2 hours ago' },
        { id: '2', title: 'Route Update', message: 'Your route has been updated due to traffic congestion on Highway 101.', time: '5 hours ago' },
        { id: '3', title: 'Delivery Confirmation', message: 'Your delivery to Distribution Center B has been confirmed.', time: '1 day ago' },
        { id: '4', title: 'System Maintenance', message: 'The system will undergo maintenance on May 12, 2025 from 2 AM to 4 AM.', time: '2 days ago' },
    ];
    const renderItem = ({ item }) => (
        <View style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage}>{item.message}</Text>
            <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
    );
    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

// --- SETTINGS SCREEN ---
const SettingsScreen = ({ navigation }) => {
    const [pushNotifications, setPushNotifications] = useState(true);
    const [locationTracking, setLocationTracking] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const { scannedVehicle, removeVehicle } = useAppContext();
    return (
        <ScrollView style={styles.container}>
            <View style={styles.profileSection}>
                <Icon name="account-circle" size={80} color="#4DA6FF" />
                <Text style={styles.profileName}>John Driver</Text>
                <Text style={styles.profileInfo}>ID: DRV12345</Text>
                <Text style={styles.profileInfo}>Vehicle: {scannedVehicle || 'None'}</Text>
                {scannedVehicle && (
                    <TouchableOpacity
                        style={[styles.scanButton, { backgroundColor: '#FF6B6B', marginTop: 10 }]}
                        onPress={removeVehicle}
                    >
                        <Text style={styles.scanButtonText}>Remove Current Vehicle</Text>
                    </TouchableOpacity>
                )}
            </View>
            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>App Settings</Text>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Push Notifications</Text>
                    <Switch value={pushNotifications} onValueChange={setPushNotifications} trackColor={{ false: "#767577", true: "#4DA6FF" }} />
                </View>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Location Tracking</Text>
                    <Switch value={locationTracking} onValueChange={setLocationTracking} trackColor={{ false: "#767577", true: "#4DA6FF" }} />
                </View>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Dark Mode</Text>
                    <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ false: "#767577", true: "#4DA6FF" }} />
                </View>
            </View>
            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Support</Text>
                <TouchableOpacity style={styles.supportItem}><Icon name="help-circle" size={24} color="#4DA6FF" /><Text style={styles.supportItemText}>Help & FAQ</Text></TouchableOpacity>
                <TouchableOpacity style={styles.supportItem}><Icon name="headset" size={24} color="#4DA6FF" /><Text style={styles.supportItemText}>Contact Support</Text></TouchableOpacity>
                <TouchableOpacity style={styles.supportItem}><Icon name="information" size={24} color="#4DA6FF" /><Text style={styles.supportItemText}>About App</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace('Login')}>
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// --- NAVIGATION ---
const Tab = createBottomTabNavigator();
const MainTabs = () => (
    <Tab.Navigator
        screenOptions={{
            tabBarActiveTintColor: '#4DA6FF',
            headerStyle: { backgroundColor: '#4DA6FF' },
            headerTintColor: 'white',
        }}
    >
        <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{ tabBarIcon: ({ color, size }) => (<Icon name="view-dashboard" color={color} size={size} />) }}
        />
        <Tab.Screen
            name="Scan QR"
            component={QRScannerScreen}
            options={{ tabBarIcon: ({ color, size }) => (<Icon name="qrcode-scan" color={color} size={size} />) }}
        />
        <Tab.Screen
            name="To-Do"
            component={TaskScreen}
            options={{ tabBarIcon: ({ color, size }) => (<Icon name="format-list-checks" color={color} size={size} />) }}
        />
        <Tab.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ tabBarIcon: ({ color, size }) => (<Icon name="bell" color={color} size={size} />) }}
        />
        <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ tabBarIcon: ({ color, size }) => (<Icon name="account-settings" color={color} size={size} />) }}
        />
    </Tab.Navigator>
);

const Stack = createStackNavigator();
const App = () => {
    const [scannedVehicle, setScannedVehicle] = useState(null);
    const [completedTasks, setCompletedTasks] = useState([]);

    const removeVehicle = () => {
        setScannedVehicle(null);
        Alert.alert('Vehicle Removed', 'Previous scanned vehicle removed. Please scan a new vehicle QR code.');
    };

    return (
        <AppContext.Provider value={{
            scannedVehicle,
            setScannedVehicle,
            completedTasks,
            setCompletedTasks,
            removeVehicle
        }}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
                    <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{
                        title: 'Delivery Task',
                        headerStyle: { backgroundColor: '#4DA6FF' },
                        headerTintColor: 'white',
                    }} />
                </Stack.Navigator>
            </NavigationContainer>
        </AppContext.Provider>
    );
};

// --- STYLES ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        backgroundColor: '#4DA6FF'
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white'
    },
    formContainer: {
        padding: 20
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 15,
        marginBottom: 15
    },
    loginButton: {
        backgroundColor: '#4DA6FF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center'
    },
    loginButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    dashboardContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15
    },
    dashboardHeader: {
        marginBottom: 20
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: 'bold'
    },
    dateText: {
        fontSize: 16,
        color: '#666'
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    statCard: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 15,
        width: '48%',
        alignItems: 'center',
        elevation: 2
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4DA6FF'
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 15
    },
    vehicleInfoBox: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
        elevation: 2
    },
    vehicleInfoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4DA6FF'
    },
    scanButton: {
        backgroundColor: '#4DA6FF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20
    },
    scanButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    centerText: {
        fontSize: 18,
        padding: 32,
        color: '#777',
        textAlign: 'center'
    },
    buttonTouchable: {
        padding: 16
    },
    buttonText: {
        fontSize: 16,
        color: '#4DA6FF'
    },
    header: {
        backgroundColor: '#4DA6FF',
        padding: 20
    },
    vehicleNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white'
    },
    statusText: {
        fontSize: 16,
        color: 'white',
        marginTop: 5
    },
    detailsContainer: {
        backgroundColor: 'white',
        margin: 10,
        padding: 15,
        borderRadius: 5
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 10
    },
    detailLabel: {
        fontWeight: 'bold',
        width: '30%'
    },
    detailValue: {
        width: '70%'
    },
    actionContainer: {
        margin: 10,
        alignItems: 'center'
    },
    actionButton: {
        backgroundColor: '#4DA6FF',
        padding: 15,
        borderRadius: 5,
        width: '90%',
        alignItems: 'center',
        marginVertical: 10
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    completionContainer: {
        alignItems: 'center',
        padding: 10
    },
    completionText: {
        fontSize: 18,
        color: '#4CAF50',
        fontWeight: 'bold',
        marginBottom: 15
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        margin: 15
    },
    taskInstructions: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 15,
        marginBottom: 10,
        fontStyle: 'italic'
    },
    listContainer: {
        padding: 10
    },
    taskItem: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 15,
        marginBottom: 10,
        elevation: 2
    },
    completedTask: {
        opacity: 0.7
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    vehicleText: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        fontSize: 12
    },
    pendingBadge: {
        backgroundColor: '#FFC107',
        color: '#000'
    },
    completedBadge: {
        backgroundColor: '#4CAF50',
        color: 'white'
    },
    taskDetails: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10
    },
    destinationText: {
        fontSize: 14,
        marginBottom: 5
    },
    notificationItem: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 15,
        marginBottom: 10,
        elevation: 2
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5
    },
    notificationMessage: {
        fontSize: 14,
        marginBottom: 10
    },
    notificationTime: {
        fontSize: 12,
        color: '#666',
        textAlign: 'right'
    },
    profileSection: {
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        margin: 10,
        borderRadius: 5
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10
    },
    profileInfo: {
        fontSize: 14,
        color: '#666',
        marginTop: 5
    },
    settingsSection: {
        backgroundColor: 'white',
        padding: 15,
        margin: 10,
        borderRadius: 5
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    settingLabel: {
        fontSize: 16
    },
    supportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    supportItemText: {
        fontSize: 16,
        marginLeft: 10
    },
    logoutButton: {
        backgroundColor: '#FF6B6B',
        margin: 10,
        padding: 15,
        borderRadius: 5,
        alignItems: 'center'
    },
    logoutButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    wrongVehicleContainer: {
        margin: 20,
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 10,
        alignItems: 'center',
        elevation: 3
    },
    wrongVehicleTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF6B6B',
        marginBottom: 15
    },
    wrongVehicleText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10
    },
    currentVehicleText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20
    },
    requiredVehicleNumber: {
        fontWeight: 'bold',
        color: '#4DA6FF',
        fontSize: 18
    },
    requiredVehicleContainer: {
        backgroundColor: '#E6F4FF',
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#4DA6FF'
    },
    requiredVehicleText: {
        fontSize: 16,
        color: '#333'
    }
});

export default App;
