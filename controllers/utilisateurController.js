import Utilisateur from "../models/Utilisateur.js";

// 📌 Get all utilisateurs
export const getUtilisateurs = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find();
    res.json(utilisateurs);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Get utilisateur by ID
export const getUtilisateurById = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findById(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(utilisateur);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// 📌 Create utilisateur
export const createUtilisateur = async (req, res) => {
  try {
    const utilisateur = new Utilisateur(req.body);
    await utilisateur.save();
    res.status(201).json(utilisateur);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la création", error: error.message });
  }
};

// 📌 Update utilisateur
export const updateUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(utilisateur);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour", error: error.message });
  }
};

// 📌 Delete utilisateur
export const deleteUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByIdAndDelete(req.params.id);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};
