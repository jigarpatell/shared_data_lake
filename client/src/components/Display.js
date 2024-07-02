import React, { useState } from "react";
import axios from "axios";
import "./Display.css";

const Display = ({ contract, account }) => {
  const [filenames, setFilenames] = useState([]);
  const [documentData, setDocumentData] = useState({});
  const [selectedFilename, setSelectedFilename] = useState("");
  const [addforfetch, setAddress] = useState(account);
  const [isDataReady, setIsDataReady] = useState(false);
  
  const fetchData = async () => {
    const Otheraddress = document.querySelector(".address").value;
    try {
      if (Otheraddress) {
         setAddress(await contract.display(Otheraddress)) ;   
      } else {
         setAddress(account) ;
      }
      console.log("Address For Fetching data is : " , addforfetch )
      const response = await axios.get(`http://localhost:5000/filenames/${addforfetch}`);
      setFilenames(response.data.filenames);
    } catch (error) {
      console.error("Error fetching filenames:", error);
    }
  };

  const fetchDocumentData = async (filename) => {
    try {
      const response = await axios.get(`http://localhost:5000/documents/${addforfetch}/${filename}`);
      const documentData = response.data;
      setSelectedFilename(filename);
      if (documentData && documentData.documents && documentData.documents.length > 0) {
        const updatedDocuments = [];

        for (const document of documentData.documents) {

          if (document.type_of_db === 'sql') {
            try {
              const sqlResponse = await axios.post('http://localhost:5001/fetch-sql-data', {
                tablename: document.stored_tablename,
              });
              

              // Modify this block to iterate through nested objects and fetch encrypted_data
                 for (const item of sqlResponse.data) {
                const decryptedData = {};
                for (const key in item) {
                  if (Object.hasOwnProperty.call(item, key) && !['encryption_key', '_id', 'type_of_db', 'stored_tablename'].includes(key)) {
                    const encryptedValue = item[key];
                    decryptedData[key] = await decryptData(encryptedValue, document.encryption_key);
                  }
                }
                updatedDocuments.push({ ...document, fetchedData: decryptedData });
              }
            } catch (error) {
              console.error('Error fetching and decrypting SQL data:', error);
            }
          } else if (document.type_of_db === 'nosql') {
            try {
              const nosqlResponse = await axios.get('http://localhost:5002/fetch-mongodb-data', {
                params: {
                  collection: addforfetch,
                },
              });
              

            const decryptedData = {};
            for (let i = 0; i < nosqlResponse.data[0].encrypted_data.length; i++) {
              const encryptedKey = nosqlResponse.data[0].encrypted_data[i].Keys;
              const encryptedValue = nosqlResponse.data[0].encrypted_data[i].Values;

              const decryptedKey = await decryptData(encryptedKey, document.encryption_key);
              const decryptedValue = await decryptData(encryptedValue, document.encryption_key);

              decryptedData[decryptedKey] = decryptedValue;
            }
              updatedDocuments.push({ ...document, fetchedData: decryptedData });
            } catch (error) {
              console.error('Error fetching and decrypting MongoDB data:', error);
            }
          }
        }
        const sanitizedDocumentData = { filename: documentData.filename, documents: updatedDocuments.map(doc => ({ ...doc, fetchedData: sanitizeData(doc.fetchedData) })) };
        setDocumentData(sanitizedDocumentData);
        setSelectedFilename(filename);
        setIsDataReady(true); // Set data readiness flag
      } else {
        console.error('No documents found or invalid document data format.');
      }
    } catch (error) {
      console.error('Error fetching document data:', error);
    }
  };

  const sanitizeData = (data) => {
    const sanitizedData = {};
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key) && !['_id', 'type_of_db', 'stored_tablename'].includes(key)) {
        sanitizedData[key] = data[key];
      }
    }
    return sanitizedData;
  };

  const decryptData = async (encryptedValue, encryptionKey) => {
    try {
      const response = await axios.get('http://localhost:5003/decrypt-value', {
        params: {
          encrypted_value: encryptedValue,
          encryption_key: encryptionKey,
        },
      });

      return response.data.decrypted_value;
    } catch (error) {
      console.error('Error decrypting data:', error);
      return null;
    }
  };

  const downloadJSON = () => {
    const sanitizedData = JSON.stringify(documentData, (key, value) => key === '_id' || key === 'type_of_db' || key === 'encryption_key' || key === 'stored_tablename' ? undefined : value, 2);
    const blob = new Blob([sanitizedData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedFilename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <input type="text" placeholder="Enter Address" className="address" />
      <button className="center button"  onClick={fetchData}>
        Get Data
      </button>
      <table>
        <thead >
          <tr style={{ color: "white" }}>
            <th>[  Filename  ]</th>
            <th>[  Action  ]</th>
          </tr>
        </thead>
        <tbody style={{ color: "white" }}>
          {filenames.map((filename, index) => (
            <tr key={index}>
              <td>{filename}</td>
              <td>
                <button onClick={() => fetchDocumentData(filename)}>Get File</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      { isDataReady && (
        <div className="popup" style={{ color: "white" }}>
          <div className="popup-content">
            <span className="close" onClick={() => setSelectedFilename("")}>&times;</span>
            <h3>{selectedFilename}</h3>
            <pre className="newtest">{JSON.stringify(documentData, (key, value) => key === '_id' || key === 'type_of_db'|| key === 'encryption_key' || key === 'stored_tablename' ? undefined : value, 2)}</pre>
            <button onClick={downloadJSON}>Download File</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Display;
