package com.property_rental.backend.photo.service;

import com.property_rental.backend.photo.entities.Photo;
import com.property_rental.backend.photo.repository.PhotoRepository;
import com.property_rental.backend.property.entities.Property;
import com.property_rental.backend.property.service.PropertyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final PropertyService propertyService;

    public PhotoService(PhotoRepository photoRepository, PropertyService propertyService) {
        this.photoRepository = photoRepository;
        this.propertyService = propertyService;
    }

//    @Transactional
//    public List<Photo> savePhotos(int propertyId, List<MultipartFile> multipartFiles) throws IOException, NoSuchElementException {
//        Property property = propertyService.findPropertyById(propertyId); // throws NoSuchElementException
//        List<Photo> photoList = new ArrayList<>();
//
//        for(MultipartFile file : multipartFiles) {
//            if(!file.isEmpty()){
//                Photo photo = new Photo(
//                        file.getOriginalFilename(),
//                        file.getBytes()
//                );
//
//                Photo savedPhoto = photoRepository.save(photo);
//                property.addPhoto(savedPhoto);
//                photoList.add(savedPhoto);
//            }
//        }
//        return photoList;
//    }
//
//    @Transactional
//    public Photo savePhoto(int propertyId, MultipartFile multipartFile) throws IOException, NoSuchElementException {
//        Property property = propertyService.findPropertyById(propertyId);
//
//        Photo savedPhoto = new Photo(
//                multipartFile.getOriginalFilename(),
//                multipartFile.getBytes()
//        );
//
//        property.addPhoto(savedPhoto);
//        return photoRepository.save(savedPhoto);
//    }
//
//    public List<Photo> getPhotosById(int propertyId) {
//        return photoRepository.findByProperty_Id(propertyId);
//    }

    @Transactional
    public List<Photo> savePhotos(int propertyId, List<MultipartFile> multipartFiles) throws IOException, NoSuchElementException {
        Property property = propertyService.findPropertyById(propertyId); // throws NoSuchElementException
        List<Photo> photoList = new ArrayList<>();

        for (MultipartFile file : multipartFiles) {
            if (!file.isEmpty()) {
                Photo photo = new Photo(
                        file.getOriginalFilename(),
                        file.getBytes(),
                        file.getContentType(),
                        file.getSize(),
                        property
                );

                Photo savedPhoto = photoRepository.save(photo);
                photoList.add(savedPhoto);

                System.out.println("Saved photo: " + savedPhoto.toString());
            }
        }
        return photoList;
    }

    @Transactional
    public Photo savePhoto(int propertyId, MultipartFile multipartFile) throws IOException, NoSuchElementException {
        Property property = propertyService.findPropertyById(propertyId);

        Photo photo = new Photo(
                multipartFile.getOriginalFilename(),
                multipartFile.getBytes(),
                multipartFile.getContentType(),
                multipartFile.getSize(),
                property
        );

        Photo savedPhoto = photoRepository.save(photo);
        System.out.println("Saved individual photo: " + savedPhoto.toString());

        return savedPhoto;
    }

    public List<Photo> getPhotosById(int propertyId) {
        List<Photo> photos = photoRepository.findByProperty_Id(propertyId);
        System.out.println("Retrieved " + photos.size() + " photos for property " + propertyId);
        return photos;
    }

    public Optional<Photo> getPhotoById(int photoId) {
        Optional<Photo> photo = photoRepository.findById(photoId);
        if (photo.isPresent()) {
            System.out.println("Retrieved photo: " + photo.get().toString());
        } else {
            System.out.println("Photo not found with id: " + photoId);
        }
        return photo;
    }

    // Get only photo metadata (without binary data) - for lightweight operations
    public List<Photo> getPhotoMetadataById(int propertyId) {
        return photoRepository.findByProperty_Id(propertyId);
    }

    @Transactional
    public boolean deletePhoto(int photoId) {
        try {
            if (photoRepository.existsById(photoId)) {
                photoRepository.deleteById(photoId);
                System.out.println("Deleted photo with id: " + photoId);
                return true;
            } else {
                System.out.println("Photo not found for deletion with id: " + photoId);
                return false;
            }
        } catch (Exception e) {
            System.err.println("Error deleting photo with id " + photoId + ": " + e.getMessage());
            throw e;
        }
    }

    // Get photo count for a property
    public long getPhotoCountByPropertyId(int propertyId) {
        List<Photo> photos = photoRepository.findByProperty_Id(propertyId);
        return photos.size();
    }

    // Check if property has photos
    public boolean hasPhotos(int propertyId) {
        return getPhotoCountByPropertyId(propertyId) > 0;
    }

    // Get main photo for a property (first photo marked as main, or just first photo)
    public Optional<Photo> getMainPhotoByPropertyId(int propertyId) {
        List<Photo> photos = photoRepository.findByProperty_Id(propertyId);

        if (photos.isEmpty()) {
            return Optional.empty();
        }

        // Look for photo marked as main
        for (Photo photo : photos) {
            if (photo.isMain()) {
                return Optional.of(photo);
            }
        }

        // If no main photo found, return first photo
        return Optional.of(photos.get(0));
    }

    // Set a photo as main photo for a property
    @Transactional
    public boolean setMainPhoto(int photoId, int propertyId) {
        try {
            List<Photo> photos = photoRepository.findByProperty_Id(propertyId);

            // First, unset all photos as main for this property
            for (Photo photo : photos) {
                if (photo.isMain()) {
                    photo.setMain(false);
                    photoRepository.save(photo);
                }
            }

            // Then set the specified photo as main
            Optional<Photo> targetPhoto = photoRepository.findById(photoId);
            if (targetPhoto.isPresent() && targetPhoto.get().getProperty().getId() == propertyId) {
                Photo photo = targetPhoto.get();
                photo.setMain(true);
                photoRepository.save(photo);
                System.out.println("Set photo " + photoId + " as main for property " + propertyId);
                return true;
            }

            return false;
        } catch (Exception e) {
            System.err.println("Error setting main photo: " + e.getMessage());
            throw e;
        }
    }
}
