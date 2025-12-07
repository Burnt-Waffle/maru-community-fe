import { authFetch } from "./authClient.js";

export const uploadImagesToS3 = async (files, uploadUrl) => {
    try {
        // Lambda에게 업로드용 URL 요청
        const fileInfos = files.map(file => ({
            fileName: file.name,
            fileType: file.type
        }));

        
        const response = await authFetch(uploadUrl, {
            method: 'POST',
            body: JSON.stringify({ files: fileInfos }) // 파일 바이너리가 아닌 JSON 전송
        });

        const jsonResponse = await response.json();
        
        // Lambda 응답: [{ uploadUrl: "...", fileUrl: "..." }, ...]
        const presignedData = jsonResponse.data;

        // 받아온 URL로 S3에 직접 업로드 (병렬 처리)
        const uploadPromises = files.map((file, index) => {
            const { uploadUrl, fileUrl } = presignedData[index];

            return fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    "Content-Type": file.type // Lambda에서 설정한 타입
                },
                body: file // 여기서 실제 파일 데이터가 전송
            }).then(res => {
                if (!res.ok) throw new Error('S3 업로드 실패');
                return fileUrl; // 성공하면 최종 저장될 URL 반환
            });
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        return uploadedUrls;

    } catch (error) {
        console.error("이미지 업로드 실패:", error);
        throw error;
    }
};