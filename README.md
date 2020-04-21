# Astronomy Image Archive
Database management, header parser and frontend for FTS files used by astronomical telescope.

This project was created for the NASA Universe of Learning AfH website, and is connected to Sonoma State University's GORT telescope. This project, the GORT telescope and the AfH website are owned and maintained by EdEon, an education center at Sonoma State University. This application works with a MongoDB instance, a folder containing .fts images from a telescope, and a React frontend. A number of design elements are specific to its current deployment at the moment, but could be modified to work for others. Backend is running with Node.js.

A live version can be seen at <a href="https://afh.sonoma.edu/archive">https://afh.sonoma.edu/archive</a>.

The frontend is written with React. The backend runs two Node.js APIs. One of them is the standard database retrieval and management, api/app.js. The other, api/files.js, handles delivering of files to the end user. This was done to prevent blocking operations when downloads were in progress, as they can sometimes be rather large and zipping can take a while. The two should be run with a manager, pm2 for example, on separate ports defined in the config file. The database handling uses a MongoDB collection so that fields didn't have to be predertimed. Object identification is accomplished by connecting with the Simbad API (<a href="https://simbad.u-strasbg.fr">https://simbad.u-strasbg.fr</a>).

The backend will sync files between the database and a directory. It expects all images to be in the directory ./img/{user}/image.fts, and with that format of users in the subdirectory. No further subdirectories are used. Any files that do not end in .fts are ignored. Any images without clear users are attributed to "GORT Staff" explicitly. 

MIME types can be an issue, especially for Safari users. FTS files are not defined in standard configurations. In the case of Apache, you'll need to add this to your apache2.conf or similar configuration file:

AddType image/fts fts
AddType image/fts fits
AddType image/fts fit

For Nginx you'll have to look up the specific syntax and file locations.

You may also need to install node-fstream globally on your server to facilitate file access.

The archive was written by Casey Lewiston and any questions or concerns can be directed to <a href="mailto:lewiston@sonoma.edu">lewiston@sonoma.edu</a>.