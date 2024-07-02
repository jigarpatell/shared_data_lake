import React, { useState } from "react";
import "./FileUpload.css";
import AWS from 'aws-sdk';

const FileUpload = ({ contract, account, provider }) => {

const [file, setFile] = useState(null);
const [fileName, setFileName] = useState("Supported Files: Pdf, Image, Csv, Json");
let bucketName = "";
const handleSubmit = async (e) => {
  e.preventDefault();
  if (file) {
      try {
          //const last5Digits = account.slice(-5);
          const newFileName = `${account}/${file.name}`;
          const fileType = file.name.split('.').pop().toLowerCase();
          switch (fileType) {
            case 'pdf':
                bucketName = "textractkvtable-------------------/async-input";
                break;
            case 'jpg':
                bucketName = "insertjpg";
                break;
            case 'csv':
                bucketName = "uploadpdf24/async-output";
                break;
            case 'json':
                bucketName = "jsontomongo";
                break;
            default:
                alert("File type should be from .pdf , .jpg , .csv , .json");
                break;
        }
          const s3 = new AWS.S3({
            accessKeyId: "xxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            secretAccessKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxx",
            region: "us-east-1"
          });

          const params = {
              Bucket: bucketName,
              Key: newFileName,
              Body: file, // Pass the file directly as the Body parameter              
          };
          

          s3.upload(params, (err, data) => {
              if (err) {
                  console.error("Error uploading file:", err);
                  alert("Unable to upload File");
              } else {
                  console.log("File uploaded successfully:", data.Location);
                  // You can perform additional actions after the file is uploaded
                  alert("Successfully File Uploaded");
                  setFileName("Supported Files: Pdf, Image, Csv, Json");
                  setFile(null);
              }
          });
      } catch (e) {
          alert("Unable to upload your File");
      }
  }
};


const retrieveFile = (event) => {
  const file = event.target.files[0];
  console.log("Selected file:", file);
  const reader = new window.FileReader();
  reader.readAsArrayBuffer(file);
  reader.onloadend = () => {
    setFile(event.target.files[0]);
  };
  const disfilename = `Selected File: ${event.target.files[0].name}`;
  setFileName(disfilename);
  event.preventDefault();
};



return (
    <div className="top">
      <form className="form" onSubmit={handleSubmit} style={{borderColor:"white"}} >
      
        <label htmlFor="file-upload" className="choose">
  Choose File
</label>
       

        <input
          disabled={!account}
          type="file"
          id="file-upload"
          name="data"
          onChange={retrieveFile}
        />
        <span className="textArea">{fileName}</span>
        <button type="submit" className="upload" disabled={!file}>
          Upload File
        </button>
      </form>
    </div>
  );
};
  
export default FileUpload;
