import { useLoaderStore } from "@/store";
import { Storage } from "aws-amplify";

/**
 * Uploads file to AWS S3 bucket and set the image url
 *
 * @param {File} file - The file to upload
 */

export const s3FileUpload = async (file: File, metaData) => {
  const loader = useLoaderStore();
  loader.changeLoadingStatus({ isLoading: true });
  const imgKey = await Storage.put(file.name, file, {
    contentType: file.type,
    metadata: metaData,
  }).then((res) => {
    loader.changeLoadingStatus({ isLoading: false });
    return res;
  });
  return `/assets/${imgKey?.key}`;
};

/**
 * Rename file
 * @param {File} originalFile
 * @param {String} newName
 */
export const renameFile = (originalFile, newName) => {
  return new File([originalFile], newName, {
    ...originalFile,
    type: originalFile.type,
  });
};
