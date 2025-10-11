import * as ChangesService from '../services/changes.services.js';

export async function getChanges(req, res) {
  try {
    const changes = await ChangesService.getChanges();
    res.status(200).json(changes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getChangeById(req, res) {
  try {
    const { id } = req.params;
    const certification = await ChangesService.getChangeById(id);

    if (certification) {
      res.status(200).json(certification);
    } else {
      res
        .status(404)
        .json({ message: `No certification found with id: ${id}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getChangesByType(req, res) {
  try {
    const { type } = req.params;
    const certifications = await ChangesService.getChangesByType(type);

    if (certifications) {
      res.status(200).json(certifications);
    } else {
      res
        .status(404)
        .json({ message: `No certifications found for type: ${type}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createChange(req, res) {
  try {
    const data = req.body;
    const created_change = await ChangesService.createChange(data);

    res.status(201).json(created_change);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
