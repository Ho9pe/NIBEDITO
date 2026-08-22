const fs = require('fs').promises;
const logger = require("./logger");
const deleteImage = async (userImagePath) => {
    try{
        await fs.access(userImagePath);
        await fs.unlink(userImagePath);
        logger.debug('Image deleted successfully');
    }
    catch(error){
        console.error('Error while deleting image:', error);
    }
}
module.exports = {deleteImage};