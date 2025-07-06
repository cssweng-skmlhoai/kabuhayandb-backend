import * as FamiliesService from '../services/families.services.js';

export async function getFamilies(req, res) {
  try {
    const families = await FamiliesService.getFamilies();

    res.status(200).json(families);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getFamiliesById(req, res) {
  try {
    const id = req.params.id;
    const family = await FamiliesService.getFamilyById(id);

    // checks if family exists
    if (family) res.status(200).json(family);
    else res.status(404).json({ message: `No family found with id: ${id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createFamilies(req, res) {
  try {
    const data = req.body;
    const created_family = await FamiliesService.createFamilies(data);

    res.status(201).json(created_family);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateFamilies(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await FamiliesService.updateFamilies(id, updates);

    // checks if family is found given id
    if (result.affectedRows === 0) {
      res.status(404).json({ message: `No family found with id: ${id}` });
    } else {
      res
        .status(200)
        .json({ success: true, affected_rows: result.affectedRows });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteFamilies(req, res) {
  try {
    const { id } = req.params;
    const affected_rows = await FamiliesService.deleteFamilies(id);

    // checks if family is found
    if (affected_rows === 0) {
      res.status(404).json({ message: `No family found with id: ${id}` });
    } else {
      res.status(200).json({ success: true, affected_rows });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
