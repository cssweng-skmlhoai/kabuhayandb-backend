import * as CertificationsService from '../services/certifications.services.js';

export async function getCertifications(req, res) {
  try {
    const certifications = await CertificationsService.getCertifications();
    res.status(200).json(certifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getCertificationById(req, res) {
  try {
    const { id } = req.params;
    const certification = await CertificationsService.getCertificationById(id);

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

export async function getCertificationByMemberId(req, res) {
  try {
    const { id } = req.params;
    const certification =
      await CertificationsService.getCertificationByMemberId(id);

    if (certification) {
      res.status(200).json(certification);
    } else {
      res
        .status(404)
        .json({ message: `No certification found for member id: ${id}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createCertification(req, res) {
  try {
    const data = req.body;
    const created = await CertificationsService.createCertification(data);

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateCertification(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await CertificationsService.updateCertification(id, updates);

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

export async function updateCertificationMultiple(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await CertificationsService.updateCertificationMultiple(
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

export async function deleteCertification(req, res) {
  try {
    const { id } = req.params;
    const affected_rows = await CertificationsService.deleteCertification(id);

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
