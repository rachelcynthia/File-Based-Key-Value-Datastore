var fs = require('fs');
var prompt = require('prompt');

if(!fs.existsSync('./store.json')){
    var start = {
        Master : ''
    };
    fs.writeFileSync('./store.json', JSON.stringify(start))
}


var jsonData = require('./store.json');

function setMasterLocation( callback )
{
    console.log("Would you like to assign Master Storage?");
    prompt.get(['ans'],function(err,result){
        if(result.ans.toLowerCase()=="no")
        {
            if(!fs.existsSync("C:/Master")){
                fs.mkdirSync("C:/Master");
                jsonData.Master="C:/Master";
                console.log("Set at default location : C:/Master");
                callback();
            }
        }
        else
        {
            prompt.get(['MasterLocation'],function(err,result){  
                if(fs.existsSync(result.MasterLocation)==false){
                    if(!fs.existsSync("C:/Master")){
                        fs.mkdirSync("C:/Master");
                        jsonData.Master="C:/Master";
                        console.log("Provided location was incorrect. Therefore set at default location : C:/Master");
                        callback();
                    }
                }
                else
                {
                    console.log("Location added successfully");
                    jsonData.Master=result.MasterLocation;
                    callback();
                }
            });
        }
    });
}
function callOperations()
{
    choice = "0"
    console.log("\n\n\nSelect one of the following operations to perform : \n1: Create a new data store\n2: Read an existing Data Store\n3: Delete a data store\n4: Exit")
    prompt.get(['choice'],function(err,result){
        if(result.choice == "1"){
            console.log("Enter the Key and Value pair that is to be created")
            prompt.get(["key","value"],function(err,result){
                if(result.key in jsonData){
                    console.log("Unable to create as key already exists!");
                    callOperations();
                }
                else{
                    createDirectory(result.key,result.value)
                }
            });
        }
        else if(result.choice == '2'){
            console.log("Enter the key of the datastore you would like to read: ");
            prompt.get(['key'],function(err,result){
                if(result.key in jsonData){
                    readContents(result.key);
                    callOperations();
                }
                else{
                    console.log("Provided key does not exist");
                    callOperations();
                }
            });
        }
        else if(result.choice=='3'){
            console.log("Enter the key of the datastore you would like to delete: ");
            prompt.get(['key'],function(err,result){
                if(result.key in jsonData){
                    deleteContents(result.key)
                    callOperations();
                }
                else{
                    console.log("Provided key does not exist");
                    callOperations();
                }
            });
        }
        else{
            fs.writeFileSync('store.json', JSON.stringify(jsonData))
        }
    });
}

function readContents(value){
    value = new String(value);
    var locations =jsonData[value]
    fs.opendir(locations,function(err,dir){
        if(err){
            console.log(err);
            callOperations();
        }
        else{
            filenames = fs.readdirSync(locations);
            console.log("Current files in the directory");
            filenames.forEach((filename) =>{
                console.log(filename);
            })
            operationForRead(locations);
        }
    });
}

function operationForRead(locations){
    if(fs.lstatSync(locations).isDirectory() == true){
        console.log("Would you like to read more files inside the " +locations + " directory ?");
        prompt.get(['ans'], function(err,result){
            if(result.ans.toLowerCase()=="Yes"){
                console.log("Enter the file/directory name")
                prompt.get(['filename'],function(err,result){
                    locations = locations + "/" + result.filename;
                    if(fs.existsSync(locations)==true)
                    {
                        if(fs.lstatSync(locations).isDirectory() == true){
                            filenames = fs.readdirSync(locations);
                            console.log("Current files in the directory");
                            filenames.forEach((filename) =>{
                                console.log(filename);
                            });
                            operationForRead(locations);
                        }
                        else{
                            var data = fs.readFileSync(locations,{flag:'r'});
                            console.log("The contents of "+ locations + "are: ");
                            console.log(data);
                            operationForRead(locations);
                        }
                    }
                });
            }
            else{
                callOperations();
            }
        });
    }
    else{
        callOperations();
    }
}

function createDirectory(key,value){
    fs.mkdirSync(jsonData.Master + "/" + value);
    jsonData[key] = jsonData.Master + "/" + value;
    callOperations();
}

function deleteContents(key){
    delete jsonData[key];
}

console.log("Welcome to the file storage System!!! \n \n ");
var answer="";
if(jsonData.Master==""){
    setMasterLocation(()=>{
        callOperations();
    });
}
else{
    callOperations();
}


