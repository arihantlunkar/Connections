import React, { useState, useEffect} from 'react';
import {Dimensions} from 'react-native'
import { SliderBox } from "react-native-image-slider-box";
import AppConstants from '../constants.json'

const ImageSlider = ({route, navigation}) => {

    const { width, height } = Dimensions.get('window');
    const [imageData, setImageData] = useState([]);

    useEffect(() => {
        if(null !== route.params.image1Link)
            imageData.push(AppConstants.BACKEND_PATH+route.params.image1Link);
        if(null !== route.params.image2Link)
            imageData.push(AppConstants.BACKEND_PATH+route.params.image2Link);
        if(null !== route.params.image3Link)
            imageData.push(AppConstants.BACKEND_PATH+route.params.image3Link);
        if(null !== route.params.image4Link)
            imageData.push(AppConstants.BACKEND_PATH+route.params.image4Link);
        if(null !== route.params.image5Link)
            imageData.push(AppConstants.BACKEND_PATH+route.params.image5Link);
        setImageData([...imageData]);
    }, []);

    return (
    <SliderBox images={imageData} sliderBoxHeight={height}  resizeMode={'contain'} dotColor={AppConstants.THEME_COLOR} inactiveDotColor="#90A4AE"/>
    )
};

export default ImageSlider;