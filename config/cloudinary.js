const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
      cloud_name: "dc0eskzxx" ,
      api_key: "645985342632788" ,  
      api_secret: "iu7MJQ6i5XHaX-yjn5-YodGakdg", 
  });

module.exports = cloudinary;