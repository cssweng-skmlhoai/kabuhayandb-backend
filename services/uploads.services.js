import { getDB } from '../config/connect.js';

export async function uploadSingleImgByMemberId(data) {
  const db = await getDB();
  const { buffer, mime_type, original_name, member_id } = data;

  const [upload] = await db.execute(
    'UPDATE credentials SET pfp = ? WHERE member_id = ?',
    [buffer, member_id]
  );

  return {
    upload: upload.affectedRows > 0,
    buffer,
    mime_type,
    original_name,
    member_id,
  };
}

export async function getPfpByMemberId(id) {
  const db = await getDB();

  const [imgs] = await db.query(
    'SELECT pfp FROM credentials WHERE member_id = ?',
    [id]
  );

  const pfp = imgs[0]?.pfp;

  if (!pfp) return null;

  return pfp;
}
