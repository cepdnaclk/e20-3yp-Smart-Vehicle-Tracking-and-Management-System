import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 200,
    backgroundColor: "#4DA6FF",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  formContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: "#4DA6FF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  dashboardHeader: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 16,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 15,
    width: "48%",
    alignItems: "center",
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4DA6FF",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
  },
  vehicleInfoBox: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
  },
  vehicleInfoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4DA6FF",
  },
  scanButton: {
    backgroundColor: "#4DA6FF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  scanButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  centerText: {
    fontSize: 18,
    padding: 32,
    color: "#777",
    textAlign: "center",
  },
  buttonTouchable: {
    padding: 16,
  },
  buttonText: {
    fontSize: 16,
    color: "#4DA6FF",
  },
  header: {
    backgroundColor: "#4DA6FF",
    padding: 20,
  },
  vehicleNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
  },
  statusText: {
    fontSize: 16,
    color: "white",
    marginTop: 5,
  },
  detailsContainer: {
    backgroundColor: "white",
    margin: 10,
    padding: 15,
    borderRadius: 5,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: "bold",
    width: "30%",
  },
  detailValue: {
    width: "70%",
  },
  actionContainer: {
    margin: 10,
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "#4DA6FF",
    padding: 15,
    borderRadius: 5,
    width: "90%",
    alignItems: "center",
    marginVertical: 10,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  completionContainer: {
    alignItems: "center",
    padding: 10,
  },
  completionText: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "bold",
    marginBottom: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 15,
  },
  taskInstructions: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 15,
    marginBottom: 10,
    fontStyle: "italic",
  },
  listContainer: {
    padding: 10,
  },
  taskItem: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  completedTask: {
    opacity: 0.7,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 12,
  },
  pendingBadge: {
    backgroundColor: "#FFC107",
    color: "#000",
  },
  completedBadge: {
    backgroundColor: "#4CAF50",
    color: "white",
  },
  taskDetails: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  destinationText: {
    fontSize: 14,
    marginBottom: 5,
  },
  notificationItem: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 10,
  },
  notificationTime: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  profileSection: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    margin: 10,
    borderRadius: 5,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  profileInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  settingsSection: {
    backgroundColor: "white",
    padding: 15,
    margin: 10,
    borderRadius: 5,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingLabel: {
    fontSize: 16,
  },
  supportItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  supportItemText: {
    fontSize: 16,
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    margin: 10,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  wrongVehicleContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  wrongVehicleTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 15,
  },
  wrongVehicleText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  currentVehicleText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  requiredVehicleContainer: {
    backgroundColor: "#E6F4FF",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#4DA6FF",
  },
  requiredVehicleText: {
    fontSize: 16,
    color: "#333",
  },
  requiredVehicleNumber: {
    fontWeight: "bold",
    color: "#4DA6FF",
    fontSize: 18,
  },
});
