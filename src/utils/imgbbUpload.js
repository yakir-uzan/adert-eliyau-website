/**
 * Upload an image file to ImgBB (free, unlimited storage).
 * Returns the permanent URL of the uploaded image.
 */
export async function uploadToImgBB(file) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!apiKey) throw new Error('ImgBB API key not configured');

  // Convert file to base64 (most reliable with ImgBB)
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const formData = new FormData();
  formData.append('image', base64);
  formData.append('name', file.name.replace(/\.[^.]+$/, '')); // filename without extension

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    throw new Error(`ImgBB responded with status ${response.status}`);
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error?.message || 'ImgBB upload failed');
  }

  return {
    url:   json.data.url,                          // full-size
    thumb: json.data.thumb?.url || json.data.url,  // ~180px thumbnail
  };
}
