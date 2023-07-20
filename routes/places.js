const express = require('express');
const router = express.Router();

const geo = require('node-geocoder');
const geocoder = geo({ provider: 'openstreetmap' });

router.get('/', async (req, res) => {
    const places = await req.db.findPlaces();
    console.log(places);
    res.json({ places: places });
});

router.put('/', async (req, res) => {
    const result = await geocoder.geocode(req.body.address);
    console.log(result)
    let address = '';
    let lat = '';
    let lng = '';
    if(result.length >= 1){
        address = result[0].formattedAddress;
        lat = result[0].latitude;
        lng = result[0].longitude;
    }
    else if (result.length == 0){
        address = req.body.address;
    }
    
    const id = await req.db.createPlace(req.body.label, address, lat, lng);
    res.json({ 
        id: id,
        label: req.body.label,
        address: address,
        lat: lat,
        lng: lng
    });
});

router.delete('/:id', async (req, res) => {
    await req.db.deletePlace(req.params.id);
    res.status(200).send();
})

module.exports = router;