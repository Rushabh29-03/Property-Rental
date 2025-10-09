package com.property_rental.backend.photo.dtos;

import com.property_rental.backend.photo.entities.Photo;
import lombok.*;

import java.util.Base64;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PhotoDto {

    private int id;
    private String filename;
    private String contentType;
    private Long fileSize;
    private boolean isMain;

    // Only include data when specifically needed
    private String base64Data;

    // Constructor for metadata only (default)
    public PhotoDto(Photo photo) {
        this.id = photo.getId();
        this.filename = photo.getFilename();
        this.contentType = photo.getContentType();
        this.fileSize = photo.getFileSize();
        this.isMain = photo.isMain();
        // Don't include base64Data by default to avoid large payloads
    }

    // Constructor with data included (for individual photo fetch)
    public PhotoDto(Photo photo, boolean includeData) {
        this.id = photo.getId();
        this.filename = photo.getFilename();
        this.contentType = photo.getContentType();
        this.fileSize = photo.getFileSize();
        this.isMain = photo.isMain();

        if (includeData && photo.getData() != null) {
            this.base64Data = Base64.getEncoder().encodeToString(photo.getData());
        }
    }

    // Static factory methods for clarity
    public static PhotoDto fromPhoto(Photo photo) {
        return new PhotoDto(photo);
    }

    public static PhotoDto fromPhotoWithData(Photo photo) {
        return new PhotoDto(photo, true);
    }

    // Helper method to check if photo has data
    public boolean hasData() {
        return base64Data != null && !base64Data.isEmpty();
    }

    // Helper method to get data URL
    public String getDataUrl() {
        if (!hasData() || contentType == null) {
            return null;
        }
        return "data:" + contentType + ";base64," + base64Data;
    }
}