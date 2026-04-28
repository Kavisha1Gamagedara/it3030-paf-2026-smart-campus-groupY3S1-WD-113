package com.smartcampus.incident.service;

import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class AttachmentStorageService {

    private final GridFsTemplate gridFsTemplate;
    private final GridFsOperations gridFsOperations;

    public AttachmentStorageService(GridFsTemplate gridFsTemplate, GridFsOperations gridFsOperations) {
        this.gridFsTemplate = gridFsTemplate;
        this.gridFsOperations = gridFsOperations;
    }

    public String saveFile(MultipartFile file) throws IOException {
        return gridFsTemplate.store(
                file.getInputStream(),
                file.getOriginalFilename(),
                file.getContentType()
        ).toString();
    }

    public GridFSFile findFile(String fileId) {
        return gridFsTemplate.findOne(
                new Query(Criteria.where("_id").is(fileId))
        );
    }

    public InputStream getFileStream(GridFSFile file) throws IOException {
        return gridFsOperations.getResource(file).getInputStream();
    }

    public String getContentType(GridFSFile file) {
        if (file.getMetadata() != null) {
            Object ct = file.getMetadata().get("_contentType");
            if (ct != null) return ct.toString();
        }
        return "application/octet-stream";
    }
}