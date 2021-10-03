import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { Icon, Avatar, Accessory } from 'react-native-elements'

const { width, height } = Dimensions.get('window');
const cardHeight = 0.22 * height;
const leftSquareInsideCardLength = 0.16 * height;

const Card = (props) => {
    const { data } = props;
    const imageSize = 0.14 * height;
    return (
        <View style={styles.card}>
            <View style={styles.cardLeftDiv}>
                <TouchableOpacity activeOpacity={0.8} onPress={data.onImgClickCallback}>
                    <Avatar size={imageSize} activeOpacity={0.7} rounded source={{ uri: data.imageUrl }}>
                    </Avatar>
                </TouchableOpacity>
            </View>
            <View style={styles.cardRightDiv}>
                <View style={styles.cardRightDivContainer}>
                    <View style={styles.cardRightDivContainerView}>
                        <View style={[styles.cardLine, { backgroundColor: data.color }]}></View>
                        <View>
                            <Text style={styles.cardText1}>{data.text1}</Text>
                            <Text style={styles.cardText2}>{data.text2}</Text>
                        </View>
                        <View style={styles.cardEllipses}>
                            <Menu>
                                <MenuTrigger>
                                    <Icon name={'dehaze'} color={styles.location.color} size={18} />
                                </MenuTrigger>
                                <MenuOptions >
                                    <MenuOption style={styles.cardMenuOption} onSelect={() => data.option1ClickCallback()} text={data.option1Text} />
                                </MenuOptions>
                            </Menu>
                        </View>
                    </View>
                    {('' === data.text3 || null === data.text3) ? null : (
                        <View style={styles.cardRightDivContainerView}>
                            <View style={styles.cardIcon}>
                                {<Icon name={'school'} color={styles.location.color} size={14} />}
                            </View>
                            <Text style={styles.cardText3}>{data.text3}</Text>
                        </View>
                    )}
                    {('' === data.text4 || null === data.text4) ? null : (
                        <View style={styles.cardRightDivContainerView}>
                            <View style={styles.cardIcon}>
                                {<Icon name={'developer-mode'} color={styles.location.color} size={14} /> }
                            </View>
                            <Text style={styles.cardText4}>{data.text4}</Text>
                        </View>
                    )}
                    {('' === data.text5 || null === data.text5) ? null : (
                        <View style={styles.cardRightDivContainerView}>
                            <View style={styles.cardIcon}>
                                {<Icon name={'insights'} color={styles.location.color} size={14} /> }
                            </View>
                            <Text style={styles.cardText5}>{data.text5}</Text>
                        </View>
                    )}
                    <View style={styles.cardRightDivContainerReverseView}>
                        <Text style={styles.cardText6}>{data.text6}</Text>
                        <View style={styles.cardIcon}>
                            {<Icon name={'location-on'} color={styles.location.color} size={14}  /> }
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default Card;

const styles = StyleSheet.create({
    card: {
        height: cardHeight,
        flexDirection: 'row',
        marginTop: 5,
        borderColor:'#000',
        borderWidth: 3,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0
    },
    cardLeftDiv: {
        flex: leftSquareInsideCardLength,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: leftSquareInsideCardLength,
        height: cardHeight,
        backgroundColor: '#fff'
    },
    cardRightDiv: {
        backgroundColor: '#f3f3f3',
        flex: width - leftSquareInsideCardLength,
    },
    cardRightDivContainer: {
        flex: 1,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    cardRightDivContainerView: {
        flexDirection: 'row'
    },
    cardRightDivContainerReverseView: {
        flexDirection: 'row-reverse'
    },
    cardLine: {
        width: 3,
        marginEnd: 7
    },
    cardIcon: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardText1: {
        fontSize: 22,
        fontWeight: 'bold'
    },
    cardText2: {
        color: '#848486',
    },
    cardText3: {
        paddingStart: 10,
    },
    cardText4: {
        paddingStart: 10,
    },
    cardText5: {
        paddingStart: 10,
    },
    cardText6: {
        paddingStart: 2
    },
    cardEllipses: {
        alignItems: 'flex-end',
        flex: 1,
    },
    cardMenuOption: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    favIcon: {
    },
    displayNone: {
        display: 'none'
    },
    location: {
        color: '#000'
    }
});
