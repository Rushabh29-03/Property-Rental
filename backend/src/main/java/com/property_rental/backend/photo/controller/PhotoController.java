package com.property_rental.backend.photo.controller;

import com.property_rental.backend.photo.dtos.PhotoDto;
import com.property_rental.backend.photo.entities.Photo;
import com.property_rental.backend.photo.service.PhotoService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/photo")
public class PhotoController {

    private final PhotoService photoService;

    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

//    @PostMapping("/{propertyId}/upload-photo")
//    public ResponseEntity<?> uploadFile(@PathVariable int propertyId, @RequestParam List<MultipartFile> files) {
//
//        // 1. Validate file count (Max 5 constraint enforced here for safety)
//        if (files == null || files.isEmpty()) {
//            return ResponseEntity.badRequest().body(Map.of("errMessage", "No files selected for upload."));
//        }
//
//        if (files.size() > 5) {
//            // This shouldn't happen if the frontend works, but it's a backend safety check
//            return ResponseEntity.badRequest().body(Map.of("errMessage", "Maximum 5 files allowed."));
//        }
//
//        // 2. Process each file
//        int successfullyProcessedCount = 0;
//        for (MultipartFile file : files) {
//            String fileName = file.getOriginalFilename();
//            long fileSize = file.getSize();
//            String fileContentType = file.getContentType();
//
//            // Basic validation
//            if (file.isEmpty() || !fileContentType.startsWith("image/")) {
//                System.err.println("Skipping invalid file: " + fileName);
//                continue;
//            }
//
//            try {
//                // 3. --- File Saving Logic ---
//                // In a real application, you would save the file to disk (e.g., in an 'uploads' directory)
//                // or upload it to a cloud storage service like Google Cloud Storage or S3.
//
//                photoService.savePhoto(propertyId, file);
//
//                // Example Log:
//                System.out.println("Processing file: " + fileName +
//                        " | Size: " + fileSize + " bytes | Type: " + fileContentType);
//
//                // For a real save:
//                // Path destinationPath = Paths.get("path/to/your/storage", fileName);
//                // Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
//
//                successfullyProcessedCount++;
//
//            } catch (Exception e) {
//                // Log and continue to the next file if one fails
//                System.err.println("Error processing file " + fileName + ": " + e.getMessage());
//            }
//        }
//
//        // 4. Return result
//        if (successfullyProcessedCount == files.size()) {
//            return ResponseEntity.ok(Map.of("message",
//                    "Successfully processed " + successfullyProcessedCount + " out of " + files.size() + " photos."));
//        } else {
//            return ResponseEntity.status(500).body(Map.of("errMessage",
//                    "Only " + successfullyProcessedCount + " out of " + files.size() + " photos were successfully processed. Check server logs."));
//        }
//    }

    @PostMapping("/{propertyId}/upload-photo")
    public ResponseEntity<Map<String, Object>> uploadFile(@PathVariable int propertyId, @RequestParam List<MultipartFile> files) {
        // Validate file count (Max 5 constraint enforced here for safety)
        if (files == null || files.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("errMessage", "No files selected for upload."));
        }

        if (files.size() > 5) {
            // This shouldn't happen if the frontend works, but it's a backend safety check
            return ResponseEntity.badRequest().body(Map.of("errMessage", "Maximum 5 files allowed."));
        }

        // Process each file
        int successfullyProcessedCount = 0;
        List<String> errorMessages = new ArrayList<>();

        for (MultipartFile file : files) {
            String fileName = file.getOriginalFilename();
            long fileSize = file.getSize();
            String fileContentType = file.getContentType();

            // Basic validation
            if (file.isEmpty()) {
                errorMessages.add("File " + fileName + " is empty");
                continue;
            }

            if (fileContentType == null || !fileContentType.startsWith("image/")) {
                errorMessages.add("File " + fileName + " is not a valid image");
                continue;
            }

            // Size validation (10MB max)
            if (fileSize > 10 * 1024 * 1024) {
                errorMessages.add("File " + fileName + " is too large (max 10MB)");
                continue;
            }

            try {
                // File Saving Logic
                photoService.savePhoto(propertyId, file);

                // Log successful processing
                System.out.println("Successfully processed file: " + fileName +
                        " | Size: " + fileSize + " bytes | Type: " + fileContentType);

                successfullyProcessedCount++;

            } catch (IOException e) {
                System.err.println("IO Exception for file " + fileName + ": " + e.getMessage());
                errorMessages.add("Failed to save file " + fileName + ": " + e.getMessage());
            } catch (Exception e) {
                System.err.println("Error processing file " + fileName + ": " + e.getMessage());
                errorMessages.add("Error processing file " + fileName + ": " + e.getMessage());
            }
        }

        // Return result
        Map<String, Object> response = new HashMap<>();

        if (successfullyProcessedCount == files.size()) {
            response.put("message", "Successfully processed " + successfullyProcessedCount + " out of " + files.size() + " photos.");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Processed " + successfullyProcessedCount + " out of " + files.size() + " photos.");
            if (!errorMessages.isEmpty()) {
                response.put("errors", errorMessages);
            }
            return ResponseEntity.status(207).body(response); // Multi-status for partial success
        }
    }


//    @GetMapping("/{propertyId}/get-photos")
//    public ResponseEntity<?> getPhotosByPropertyId(@PathVariable int propertyId) {
//        try {
//            List<Photo> photoList = photoService.getPhotosById(propertyId);
//            if(photoList.isEmpty()){
//                return ResponseEntity.notFound().build();
//            }
//
//            Map<String, Object> response = new HashMap<>();
//            response.put("message", "photos fetched for property: "+propertyId);
//
//            List<PhotoDto> photoDtos = new ArrayList<>();
//            for (int i = 0; i < photoList.size(); i++) {
//                photoDtos.add(new PhotoDto(photoList.get(i)));
//            }
//
//            return ResponseEntity.ok().body(Map.of("message", "photos fetched for property: "+propertyId,
//                    "photos", photoDtos));
//        } catch (Exception e) {
//            return ResponseEntity.internalServerError().body(Map.of("errMessage", e.getMessage()));
//        }
//    }

    // Get photo metadata only (no binary data) - LIGHTWEIGHT
    @GetMapping("/{propertyId}/get-photos")
    public ResponseEntity<Map<String, Object>> getPhotosByPropertyId(@PathVariable int propertyId) {
        try {
            List<Photo> photoList = photoService.getPhotosById(propertyId);

            if (photoList.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "message", "No photos found for property: " + propertyId,
                        "photos", new ArrayList<>()
                ));
            }

            // Create DTOs without binary data to avoid large payloads
            List<PhotoDto> photoDtos = photoList.stream()
                    .map(PhotoDto::fromPhoto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok().body(Map.of(
                    "message", "Photo metadata fetched for property: " + propertyId,
                    "photos", photoDtos
            ));
        } catch (Exception e) {
            System.err.println("Error fetching photos for property " + propertyId + ": " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("errMessage", e.getMessage()));
        }
    }

    // Get individual photo with full data - for displaying specific images
    @GetMapping("/image/{photoId}")
    public ResponseEntity<Map<String, Object>> getPhotoById(@PathVariable int photoId) {
        try {
            Optional<Photo> photoOpt = photoService.getPhotoById(photoId);

            if (photoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Photo photo = photoOpt.get();
            PhotoDto photoDto = PhotoDto.fromPhotoWithData(photo);

            return ResponseEntity.ok().body(Map.of(
                    "message", "Photo fetched successfully",
                    "photo", photoDto
            ));
        } catch (Exception e) {
            System.err.println("Error fetching photo " + photoId + ": " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("errMessage", e.getMessage()));
        }
    }

    // Get photo as raw bytes for direct image display
    @GetMapping("/image/{photoId}/raw")
    public ResponseEntity<byte[]> getPhotoRaw(@PathVariable int photoId) {
        try {
            Optional<Photo> photoOpt = photoService.getPhotoById(photoId);

            if (photoOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Photo photo = photoOpt.get();

            HttpHeaders headers = new HttpHeaders();

            // Set content type
            if (photo.getContentType() != null) {
                headers.setContentType(MediaType.parseMediaType(photo.getContentType()));
            } else {
                headers.setContentType(MediaType.IMAGE_JPEG); // Default fallback
            }

            headers.setContentLength(photo.getData().length);
            headers.set("Content-Disposition", "inline; filename=\"" + photo.getFilename() + "\"");

            // Add cache headers for better performance
            headers.setCacheControl("public, max-age=31536000"); // Cache for 1 year

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(photo.getData());

        } catch (Exception e) {
            System.err.println("Error fetching raw photo " + photoId + ": " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Delete photo endpoint
    @DeleteMapping("/image/{photoId}")
    public ResponseEntity<Map<String, Object>> deletePhoto(@PathVariable int photoId) {
        try {
            boolean deleted = photoService.deletePhoto(photoId);

            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error deleting photo " + photoId + ": " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("errMessage", e.getMessage()));
        }
    }

    // Get photo count for a property
    @GetMapping("/{propertyId}/count")
    public ResponseEntity<Map<String, Object>> getPhotoCount(@PathVariable int propertyId) {
        try {
            List<Photo> photos = photoService.getPhotosById(propertyId);
            return ResponseEntity.ok(Map.of(
                    "propertyId", propertyId,
                    "photoCount", photos.size()
            ));
        } catch (Exception e) {
            System.err.println("Error getting photo count for property " + propertyId + ": " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("errMessage", e.getMessage()));
        }
    }
}
