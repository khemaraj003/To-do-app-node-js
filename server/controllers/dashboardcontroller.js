const Note = require('../models/Notes');
const mongoose = require('mongoose');

// get dashboard
exports.dashboard = async (req, res, next) => {


    let perPage = 12;
    let page = parseInt(req.query.page) || 1;

    const locals = {
        title: 'Dashboard',
        description: 'free Nodejs notes app'
    };

    try {
        console.log("req.user:", req.user); // Debugging line to check req.user

        if (!req.user || !req.user.id) {
            throw new Error('User is not authenticated');
        }

        const userId = new mongoose.Types.ObjectId(req.user.id);

        const notes = await Note.aggregate([
            {
                $sort: {
                    createdAt: -1,
                }
            },
            {
                $match: { user: userId }
            },
            {
                $project: {
                    title: { $substr: ["$title", 0, 30] },
                    body: { $substr: ["$body", 0, 30] },
                }
            }
        ])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await Note.countDocuments({ user: userId }).exec();

        res.render('dashboard/index', {
            userName: req.user.firstName,
            locals,
            notes,
            layout: '../views/layouts/dashboard',
            current: page,
            pages: Math.ceil(count / perPage)
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};


exports.dashboardViewNote = async (req, res) => {
    const note = await Note.findById({ _id: req.params.id })
        .where({ user: req.user.id }).lean();
    if (note) {
        res.render('dashboard/view-note', {
            noteID: req.params.id,
            note,
            layout: '../views/layouts/dashboard'
        });
    } else {
        res.send("something went wrong")
    }
}




exports.dashboardUpdateNote = async (req, res) => {
    try {
        const result = await Note.findByIdAndUpdate(
            req.params.id, // The ID of the note to update
            { title: req.body.title, body: req.body.body }, // Fields to update
            { new: true, runValidators: true } // Options: Return the updated document and run validators
        ).where({ user: req.user.id }); // Ensure the user owns the note

        if (!result) {
            return res.status(404).send("Note not found");
        }

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send("An error occurred while updating the note."); // Send an error response
    }
};



exports.dashboardDeleteNote = async (req, res) => {
    try {
        await Note.deleteOne({ _id: req.params.id }).where({ user: req.user.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
}



exports.dashboardAddNote = async (req, res) => {
    res.render('dashboard/add', {
        layout: '../views/layouts/dashboard',
        note: {} // Pass an empty note object
    });
};

// exports.dashboardAddNote = (req, res) => {
//     const locals = {
//         title: 'Add Note',
//         description: 'Add a new note'
//     };

//     res.render('dashboard/add', {
//         locals,
//         note: {} // Pass an empty note object if no note is provided
//     });
// };



exports.dashboardAddNoteSubmit=async(req,res)=>{
    try {
        req.body.user=req.user.id;
        await Note.create(req.body);
        res.redirect('/dashboard');    
    } catch (error) {
        console.log(error);
    }
}

exports.dashboardSearch=async (req,res)=>{
    try {
       res.render('/dashboard/search',{
        searchResults:'',
        layout:'../views/layout/dashboard'
       }) 
    } catch (error) {
        console.log(error);
    }
}

exports.dashboardSearchSubmit = async (req, res) => {
    try {
      let searchTerm = req.body.searchTerm;
      const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
  
      const searchResults = await Note.find({
        $or: [
          { title: { $regex: new RegExp(searchNoSpecialChars, "i") } },
          { body: { $regex: new RegExp(searchNoSpecialChars, "i") } },
        ],
      }).where({ user: req.user.id });
  
      res.render("dashboard/search", {
        searchResults,
        layout: "../views/layouts/dashboard",
      });
    } catch (error) {
      console.log(error);
    }
  };