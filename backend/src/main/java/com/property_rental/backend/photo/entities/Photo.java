package com.property_rental.backend.photo.entities;

import com.property_rental.backend.property.entities.Property;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;

import java.util.Arrays;

@Entity
@Table(name = "photos")
@DynamicInsert
public class Photo {

    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Setter
    @Getter
    @Column(name = "filename")
    private String filename;

    @Setter
    @Getter
    @Column(name = "data", length = 10485760, columnDefinition = "bytea") // Setting max length (10MB)
    private byte[] data;

    @Setter
    @Getter
    @Column(name = "content_type")
    private String contentType;

    @Setter
    @Getter
    @Column(name = "file_size")
    private Long fileSize;

    @Setter
    @Getter
    @Column(name = "is_main", nullable = false)
    private boolean isMain = false;

    // PHOTOS TO PROPERTY
    @Setter
    @Getter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pr_id", nullable = false)
    private Property property;

    // Empty constructor
    public Photo() {}

    // Constructor
    public Photo(String filename, byte[] data) {
        this.filename = filename;
        this.data = data;
    }

    // Enhanced constructor
    public Photo(String filename, byte[] data, String contentType, Long fileSize) {
        this.filename = filename;
        this.data = data;
        this.contentType = contentType;
        this.fileSize = fileSize;
    }

    // Constructor with property
    public Photo(String filename, byte[] data, String contentType, Long fileSize, Property property) {
        this.filename = filename;
        this.data = data;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.property = property;
    }

    @Override
    public String toString() {
        return "Photo{" +
                "id=" + id +
                ", filename='" + filename + '\'' +
                ", contentType='" + contentType + '\'' +
                ", fileSize=" + fileSize +
                ", isMain=" + isMain +
                ", propertyId=" + (property != null ? property.getId() : null) +
                '}';
    }

    // Helper method to check if photo has data
    public boolean hasData() {
        return data != null && data.length > 0;
    }

    // Helper method to get file size in human readable format
    public String getFormattedFileSize() {
        if (fileSize == null || fileSize == 0) {
            return "0 Bytes";
        }

        final long k = 1024;
        final String[] sizes = {"Bytes", "KB", "MB", "GB"};
        final int i = (int) Math.floor(Math.log(fileSize) / Math.log(k));

        return String.format("%.2f %s", fileSize / Math.pow(k, i), sizes[i]);
    }
}