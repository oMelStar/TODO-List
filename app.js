
const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')


const app = express()
const mongoose = require('mongoose')


app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))
app.set("view engine", "ejs")

mongoose.connect("mongodb://localhost:27017/toDoListDB",{useNewUrlParser:true, useUnifiedTopology: true})

const itemsSchema = {
    name: String
}
const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Press + sign to add new task!"
})

const defaultArr= [item1]

const listSchema = {
    name:String,
    items: [itemsSchema]
}

const List = mongoose.model("list", listSchema)

app.get("/", function(req,res){

    Item.find({}, function(err, foundItem){
        if(foundItem===0)
        {
               Item.insertMany(defaultArr, function(err){
                if(err)
                    console.log(err)
                else
                    console.log("success!")
            })
            res.redirect("/")
        }else{
            res.render("list", {
                kindOfDay:"Today",
                newItems:foundItem
            })
        }
    })
})


app.get("/:customerList",function(req,res){
    const customerName= _.capitalize(req.params.customerList)

    List.findOne({name: customerName}, function(err,foundList){
        if(!err)
            if(!foundList){
                const list = new List({
                    name:customerName,
                    items: defaultArr
                })
                list.save()
                res.redirect("/"+customerName)
            }else{
                res.render("list", {
                    kindOfDay:foundList.name,
                    newItems:foundList.items
                })
            }
    })



})

app.post("/",function(req,res){

    const itemName = req.body.txt1
    const listName= req.body.list

    const item = new Item({
        name: itemName
    })

    if(listName === "Today"){
        item.save()
        res.redirect("/")
    }else{
        List.findOne({name: listName}, function(err, found){
            found.items.push(item)
            found.save()
            res.redirect("/"+listName)
        })
    }

})

app.post("/delete", function(req,res){
    const itemId = req.body.checkbox
    const listName = req.body.listName

    if(listName === "Today"){
        Item.findByIdAndDelete(itemId, function(err){
            if(!err)
                {
                    console.log("Item remove successfuly!")
                    res.redirect("/")
                }
        })
    }else{
        List.findOneAndUpdate({name: listName}, {$pull:{items: { _id: itemId}}}, function(err, found){
            if(!err){
                console.log("Item remove successfuly!")
                res.redirect("/"+listName)
            }
        })
    }
})

app.listen(3000, function(){
    console.log("listening to port 3000")
})