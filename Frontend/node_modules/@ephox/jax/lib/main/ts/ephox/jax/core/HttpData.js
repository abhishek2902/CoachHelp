import { DataType } from './DataType';
export const jsonData = (data) => ({ type: DataType.JSON, data });
export const blobData = (data) => ({ type: DataType.Blob, data });
export const textData = (data) => ({ type: DataType.Text, data });
export const formData = (data) => ({ type: DataType.FormData, data });
export const multipartFormData = (data) => ({ type: DataType.MultipartFormData, data });
//# sourceMappingURL=HttpData.js.map