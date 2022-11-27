import express, { response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, getAllFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]
  app.get( "/filteredimage", async ( req, res ) => {

    let { image_url } = req.query;
    let ret_msg: string;
    let img_files: string[];

    try {
      if ( !image_url ) {
        ret_msg = "img_url is required! Cannot be empty!";
        throw `${ret_msg}`;
      }     

      const img_path = await filterImageFromURL(image_url);
      res.status(200).sendFile(img_path, null, err => {
        if (err) {
          ret_msg = "Failed to send the image file response to client!";
          throw `${ret_msg}`;
        } else {
          img_files = getAllFiles();
          if (img_files.length) {
            deleteLocalFiles(img_files);
          }
        }
      });

    }
    catch { 
      if ( !ret_msg ) {
        ret_msg = `Failed to download image from ${image_url}! \
                    Check the image's accessibility!`;
        res.status(422);
      } else {
        res.status(400);
      }
      res.send(`${ret_msg}`);
    }
    
  } );

  /**************************************************************************** */

  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();