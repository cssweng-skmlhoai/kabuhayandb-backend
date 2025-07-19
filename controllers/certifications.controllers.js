import * as CertificationsService from '../services/certifications.services.js';

export async function getCertifications(req, res) {
  try {
    const certifications = await CertificationsService.getCertifications();

    res.status(200).json(certifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCertificationsById(req, res) {
  try {
    const id = req.params.id;
    const certification = await CertificationsService.getCertificationsById(id);

    if (certification) {
      delete certification.password;
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

export async function createCertifications(req, res) {
  try {
    const data = req.body;
    const created_certification =
      await CertificationsService.createCertifications(data);

    res.status(201).json(created_certification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateCertifications(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await CertificationsService.updateCertifications(
      id,
      updates
    );

    if (result.affectedRows === 0) {
      res
        .status(404)
        .json({ message: `No certification found with id: ${id}` });
    } else {
      res
        .status(200)
        .json({ success: true, affected_rows: result.affectedRows });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function deleteCertifications(req, res) {
  try {
    const { id } = req.params;
    const affected_rows = await CertificationsService.deleteCertifications(id);

    if (affected_rows === 0) {
      res
        .status(404)
        .json({ message: `No certification found with id: ${id}` });
    } else {
      res.status(200).json({ success: true, affected_rows });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
