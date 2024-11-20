import express ,{Express}from "express";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();
const app:Express = express();
app.use(express.json());
app.use(cors());
const port =process.env.SERVER_PORT || 3000;



app.get("/", (req, res) => {  
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log("Server is running on port 3000");
});
