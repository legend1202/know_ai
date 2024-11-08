import { SegmentationQuestions } from "../../types/user.segmentation";
import { ServerResponse, apiRequest } from "./client";

export const createSegmentation = async (
  payload: SegmentationQuestions,
  token: string
): Promise<SegmentationQuestions | null> => {
  const res = await apiRequest<ServerResponse<SegmentationQuestions>>(
    "post",
    `userSegmentation`,
    token,
    payload
  );

  if (!res.data.success) return null;

  return res.data.result;
};
