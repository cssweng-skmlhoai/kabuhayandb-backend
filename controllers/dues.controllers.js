import * as DuesService from '../services/dues.services.js';
import 'dotenv/config';

export async function getDues(req, res) {
  try {
    const dues = await DuesService.getDues();

    res.status(200).json(dues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getDuesById(req, res) {
  try {
    const { id } = req.params.id;
    const due = await DuesService.getDueById(id);
    if (due) res.status(200).json(due);
    else res.status(404).json({ message: `No due found with id: ${id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createDues(req, res) {
  try {
    const data = req.body;
    const created_due = await DuesService.createDues(data);

    res.status(201).json(created_due);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateDues(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await DuesService.updateDues(id, updates);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: `No due found with id: ${id}` });
    } else {
      res
        .status(200)
        .json({ success: true, affected_rows: result.affectedRows });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteDues(req, res) {
  try {
    const { id } = req.params;
    const affected_rows = await DuesService.deleteDues(id);

    if (affected_rows === 0) {
      res.status(404).json({ message: `No due found with id: ${id}` });
    } else {
      res.status(200).json({ success: true, affected_rows });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
