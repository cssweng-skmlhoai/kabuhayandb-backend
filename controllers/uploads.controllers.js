import * as UploadServices from '../services/uploads.services.js';

export async function uploadImgByMemberId(req, res) {
  try {
    const data = {
      buffer: req.file.buffer,
      mime_type: req.file.mimetype,
      original_name: req.file.originalname,
      member_id: req.params.id,
    };

    const upload = await UploadServices.uploadSingleImgByMemberId(data);

    if (upload.upload) res.status(200).json(upload);
    else
      res
        .status(400)
        .json({
          error: `Failed PFP upload for member_id: ${data.member_id}, affectedRows = 0.`,
        });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
