import Voiture from "../models/Voiture.js";

// 📌 Get all voitures
export const getVoitures = async (req, res) => {
  try {
    const voitures = await Voiture.find();
    res.json(voitures);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Get voiture by ID
export const getVoitureById = async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return res.status(404).json({ message: "Voiture non trouvée" });
    }
    res.json(voiture);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Create voiture
export const createVoiture = async (req, res) => {
  try {
    const voiture = new Voiture(req.body);
    await voiture.save();
    res.status(201).json(voiture);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la création", error: error.message });
  }
};

// 📌 Update voiture
export const updateVoiture = async (req, res) => {
  try {
    const voiture = await Voiture.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!voiture) {
      return res.status(404).json({ message: "Voiture non trouvée" });
    }
    res.json(voiture);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};

// 📌 Delete voiture
export const deleteVoiture = async (req, res) => {
  try {
    const voiture = await Voiture.findByIdAndDelete(req.params.id);
    if (!voiture) {
      return res.status(404).json({ message: "Voiture non trouvée" });
    }
    res.json({ message: "Voiture supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
