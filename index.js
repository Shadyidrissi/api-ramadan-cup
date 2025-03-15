const express = require('express');
const mongoose = require('mongoose');
const Players = require('./modules/playersSchema');
const Clubs = require('./modules/clubsSchema');
const PlayerClub = require('./modules/playerClubSchema');
const Match = require('./modules/matchSchema');



const app = express();
const port = 3000;
app.use(express.json());
const cors = require("cors");
app.use(cors());
app.get('/', async (req, res) => {
    res.send("Done");
});
// إظهار جميع اللاعبين
app.get('/show_all_players', async (req, res) => {
    const data = await Players.find(); 
    res.status(200).json(data);
});

// إضافة لاعب جديد
app.post('/add_new_player', async (req, res) => {
    console.log("Received data:", req.body); // تحقق من البيانات القادمة من React
    
    const { name, group } = req.body;
    if (!name || !group) {
        return res.status(400).json({ error: 'الرجاء ملء جميع الحقول المطلوبة' });
    }

    try {
        const newPlayer = new Players({ name, group });
        const savePlayer = await newPlayer.save();
        res.status(201).json({ message: 'تمت إضافة اللاعب بنجاح', player: savePlayer });
    } catch (error) {
        console.error("Error saving player:", error);
        res.status(500).json({ error: `فشل في إضافة اللاعب: ${error.message}` });
    }
});


// إظهار جميع الأندية
app.get('/show_all_club', async (req, res) => {
    const data = await Clubs.find();
    res.status(200).json(data);
});

// إضافة نادٍ جديد
app.post('/add_new_club', async (req, res) => {
    const { name, logo } = req.body;
    if (!name || !logo) {
        return res.status(400).json({ error: 'الرجاء ملء جميع الحقول المطلوبة' });
    }
    try {
        const newClub = new Clubs({ name, logo });
        const saveClub = await newClub.save();
        res.status(201).json({ message: 'تمت إضافة النادي بنجاح', club: saveClub });
    } catch (error) {
        res.status(500).json({ error: `فشل في إضافة النادي: ${error.message}` });
    }
});

// تحديث نادي
app.put("/update_club/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const updatedClub = await Clubs.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
        if (!updatedClub) {
            return res.status(404).json({ message: 'النادي غير موجود' });
        }
        res.status(200).json(updatedClub);
    } catch (error) {
        res.status(500).json({ message: 'خطأ أثناء تحديث النادي', error });
    }
});
// حذف نادي حسب ID
app.delete("/delete_club/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedClub = await Clubs.findByIdAndDelete(id);
        
        if (!deletedClub) {
            return res.status(404).json({ message: 'النادي غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف النادي بنجاح', club: deletedClub });
    } catch (error) {
        res.status(500).json({ message: 'خطأ أثناء حذف النادي', error });
    }
});


// إضافة مباراة
app.post('/add-match', async (req, res) => {
    try {
        const { clubA, clubB, logoA, logoB, time, stadium } = req.body;
        const newMatch = new Match({ clubA, clubB, logoA, logoB, time, stadium, completed: 0 });
        await newMatch.save();
        res.status(201).json({ message: 'تمت إضافة المباراة بنجاح', match: newMatch });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء إضافة المباراة', error });
    }
});

// تحديث نتيجة مباراة
app.post('/update-match', async (req, res) => {
    try {
        const { matchId, scoreA, scoreB } = req.body;
        if (isNaN(scoreA) || isNaN(scoreB)) {
            return res.status(400).json({ message: 'يجب إدخال أرقام صحيحة للنتيجة' });
        }
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: 'المباراة غير موجودة' });
        }
        match.scoreA = scoreA;
        match.scoreB = scoreB;
        match.completed = 1;
        await match.save();
        
        const clubA = await Clubs.findById(match.clubA);
        const clubB = await Clubs.findOne(match.clubB );
        if (!clubA || !clubB) {
            return res.status(404).json({ message: 'أحد الأندية غير موجود' });
        }
        
        clubA.goal = (clubA.goal || 0) + scoreA;
        clubA.conceded = (clubA.conceded || 0) + scoreB;
        clubB.goal = (clubB.goal || 0) + scoreB;
        clubB.conceded = (clubB.conceded || 0) + scoreA;
        
        if (scoreA > scoreB) {
            clubA.win = (clubA.win || 0) + 1;
            clubB.loss = (clubB.loss || 0) + 1;
        } else if (scoreA < scoreB) {
            clubB.win = (clubB.win || 0) + 1;
            clubA.loss = (clubA.loss || 0) + 1;
        } else {
            clubA.draw = (clubA.draw || 0) + 1;
            clubB.draw = (clubB.draw || 0) + 1;
        }
        
        await clubA.save();
        await clubB.save();
        res.json({ message: 'تم تحديث النتيجة وحساب النقاط', match });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء تحديث المباراة', error });
    }
});

// ترتيب الأندية حسب النقاط
app.get('/clubs-ranking', async (req, res) => {
    try {
        const clubs = await Clubs.find();
        const rankedClubs = clubs.map(club => ({
            ...club.toObject(),
            points: (club.win || 0) * 3 + (club.draw || 0),
        })).sort((a, b) => b.points - a.points || (b.goal || 0) - (a.goal || 0));
        res.json(rankedClubs);
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء جلب ترتيب الأندية', error });
    }
});
app.get('/show_all_matches', async (req, res) => {
    const data = await Match.find();
    res.status(200).json(data);
});
app.delete("/delete_match/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMatch = await Match.findByIdAndDelete(id);
        
        if (!deletedMatch) {
            return res.status(404).json({ message: 'النادي غير موجود' });
        }

        res.status(200).json({ message: 'تم حذف النادي بنجاح', club: deletedMatch });
    } catch (error) {
        res.status(500).json({ message: 'خطأ أثناء حذف النادي', error });
    }
});

// تشغيل الخادم
const startServer = async () => {
    try {
        await mongoose.connect('mongodb+srv://SHADY:vwi0DV5138iPRKqV@data.64zfk.mongodb.net/?retryWrites=true&w=majority&appName=data', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ database");
        app.listen(port, () => {
            console.log(`🚀 server ${port}`);
        });
    } catch (error) {
        console.error("❌ فشل الاتصال بقاعدة البيانات", error);
    }
};
startServer();