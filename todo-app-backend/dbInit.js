const sequelize = require("./config/database");
   const Todo = require("./models/Todo");

   const initDb = async () => {
     try {
       await sequelize.authenticate();
       console.log("Connection has been established successfully.");
       await sequelize.sync({ force: true });
       console.log("Database synced.");
     } catch (error) {
       console.error("Unable to connect to the database:", error);
     }
   };

   initDb();