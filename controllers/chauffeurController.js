import Chauffeur from "../models/Chauffeur.js";

// 📌 Get all chauffeurs
export const getChauffeurs = async (req, res) => {
  try {
    const chauffeurs = await Chauffeur.find();
    res.json(chauffeurs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Get chauffeur by ID
export const getChauffeurById = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findById(req.params.id);
    if (!chauffeur) {
      return res.status(404).json({ message: "Chauffeur non trouvé" });
    }
    res.json(chauffeur);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Create a chauffeur
export const createChauffeur = async (req, res) => {
  try {
    const chauffeur = new Chauffeur(req.body);
    await chauffeur.save();
    res.status(201).json(chauffeur);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la création", error: error.message });
  }
};

// 📌 Update chauffeur
export const updateChauffeur = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // return updated document
        runValidators: true,
      }
    );
    if (!chauffeur) {
      return res.status(404).json({ message: "Chauffeur non trouvé" });
    }
    res.json(chauffeur);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};

// 📌 Delete chauffeur
export const deleteChauffeur = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findByIdAndDelete(req.params.id);
    if (!chauffeur) {
      return res.status(404).json({ message: "Chauffeur non trouvé" });
    }
    res.json({ message: "Chauffeur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
