import { showToast } from "@/services/toast/toast.service";
import { useLoaderStore } from "@/store";
import { generateUniqueKey } from "@/utils";
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
  })
    .then((res) => {
      return res;
    })
    .catch((error) => {
      console.log("Error uploading file:", error);
    })
    .finally(() => {
      loader.changeLoadingStatus({ isLoading: false });
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

/**
 * Uploads file to AWS S3 bucket and set the image url
 *
 * @param {File[]} files - The file to upload
 */

export const s3MultipleFileUpload = async (files: File[]) => {
  const fileLinks: string[] = [];

  const uploadPromises = files.map(async (file) => {
    //rename the file using trip id
    let renamedFile: File | null = null;
    const ext = file.name.split(".")[1];
    renamedFile = renameFile(file, `supp_${generateUniqueKey()}.${ext}`);
    const imgKey = await Storage.put(renamedFile.name, renamedFile, {
      contentType: file.type,
    });
    fileLinks.push(`/assets/${imgKey?.key}`);
    return imgKey;
  });

  const loader = useLoaderStore();
  loader.changeLoadingStatus({ isLoading: true });
  try {
    await Promise.all(uploadPromises);
    loader.changeLoadingStatus({ isLoading: false });
    return fileLinks;
  } catch (error) {
    loader.changeLoadingStatus({ isLoading: false });
    showToast("error", "Error uploading files:");
    throw error;
  }
};
