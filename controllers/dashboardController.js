// controllers/dashboardController.js
import Shared from "../models/Commun.js";

export const getDashboardStats = async (_req, res) => {
  try {
    const [
      totalVehicles,
      activeDrivers,
      ongoingAssignments,
      carsInUseDistinct,
    ] = await Promise.all([
      Shared.countDocuments({ type: "cars" }),
      Shared.countDocuments({ type: "drivers", status: true }),
      Shared.countDocuments({ type: "affectations", status: true }),
      Shared.distinct("data.carId", { type: "affectations", status: true }),
    ]);

    const vehiclesInUse = carsInUseDistinct.length;
    const availableVehicles = Math.max(0, totalVehicles - vehiclesInUse);

    res.json({
      totalVehicles,
      vehiclesInUse,
      activeDrivers,
      ongoingAssignments,
      availableVehicles,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
