import * as Cloudinary from 'cloudinary';
import { environments } from './environments';

export const cloudinary = Cloudinary.v2;

const cloudinaryConfig = cloudinary.config({
  cloud_name: environments.CLOUDINARY_NAME,
  api_key: environments.CLOUDINARY_KEY,
  api_secret: environments.CLOUDINARY_SECRET,
});

cloudinary.config(cloudinaryConfig);

export const cloudinaryUpload = async (image: string) => {
  try {
    const res = await cloudinary.uploader.upload(image, {
      folder: 'helar/images',
      transformation: [
        { width: 500, height: 500, crop: 'thumb', gravity: 'face' },
        { quality: 'auto' },
        { format: 'auto' },
      ],
    });

    return {
      publicId: res.public_id,
      imageUrl: res.secure_url,
    };
  } catch (error) {
    console.log('[Cloudinary:uploadImage]', error);
  }
};

export const deleteImage = async (
  publicId: string,
): Promise<Cloudinary.DeleteApiResponse> => {
  return cloudinary.uploader.destroy(publicId);
};
