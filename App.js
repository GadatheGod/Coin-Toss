import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');
const COIN_SIZE = width * 0.55;

export default function App() {
  const [result, setResult] = useState(null);
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultScale = useRef(new Animated.Value(0.8)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const showingHeads = useRef(true);

  const total = heads + tails;
  const headsPct = total === 0 ? 50 : Math.round((heads / total) * 100);
  const tailsPct = 100 - headsPct;

  const toss = () => {
    if (busy) return;
    setBusy(true);
    resultOpacity.setValue(0);
    resultScale.setValue(0.8);

    const outcome = Math.random() < 0.5;
    showingHeads.current = outcome;

    // Ripple burst
    rippleScale.setValue(1);
    rippleOpacity.setValue(0.8);
    Animated.parallel([
      Animated.timing(rippleScale, {
        toValue: 2.4,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(rippleOpacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Flip + bounce
    flipAnim.setValue(0);
    bounceAnim.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -70,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: -120,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: -70,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(flipAnim, {
        toValue: outcome ? 5 : 5.5,
        duration: 950,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (outcome) setHeads((h) => h + 1);
      else setTails((t) => t + 1);
      setResult(outcome ? 'Heads' : 'Tails');
      setHistory((prev) => [outcome ? 'H' : 'T', ...prev].slice(0, 16));

      Animated.parallel([
        Animated.spring(resultOpacity, { toValue: 1, useNativeDriver: true }),
        Animated.spring(resultScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      setBusy(false);
    });
  };

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5, 5.5],
    outputRange: [
      '0deg',
      '360deg',
      '720deg',
      '1080deg',
      '1440deg',
      '1800deg',
      '1980deg',
    ],
  });

  const headOpacity = flipAnim.interpolate({
    inputRange: [
      0, 0.24, 0.25, 0.74, 0.75, 1.24, 1.25, 1.74, 1.75, 2.24, 2.25, 2.74, 2.75,
      3.24, 3.25, 3.74, 3.75, 4.24, 4.25, 4.74, 4.75, 5, 5.5,
    ],
    outputRange: [
      1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0,
    ],
  });

  const tailOpacity = flipAnim.interpolate({
    inputRange: [
      0, 0.24, 0.25, 0.74, 0.75, 1.24, 1.25, 1.74, 1.75, 2.24, 2.25, 2.74, 2.75,
      3.24, 3.25, 3.74, 3.75, 4.24, 4.25, 4.74, 4.75, 5, 5.5,
    ],
    outputRange: [
      0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
    ],
  });

  const donate = () => {
    const upiUrl = 'upi://pay?pa=prvbal-3@okicici&pn=Coin%20Toss&cu=INR';
    Linking.canOpenURL(upiUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(upiUrl);
        } else {
          Alert.alert('GPay / UPI not found', 'Please install Google Pay or any UPI app to donate.');
        }
      })
      .catch(() => Alert.alert('Error', 'Could not open UPI app.'));
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0e0c0a" />

      {/* Dark background */}
      <View style={StyleSheet.absoluteFill}>
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: '#0e0c0a' }]}
        />
        {/* Subtle gold glow top */}
        <View style={styles.glowTop} />
        {/* Subtle purple glow bottom */}
        <View style={styles.glowBot} />
        {/* Dot grid pattern */}
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.bgDot,
              {
                top: (i % 5) * 140 + 20,
                left: Math.floor(i / 5) * 100 + 10,
              },
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleBlock}>
          <View style={styles.divider} />
          <Text style={styles.title}>Coin Toss</Text>
          <Text style={styles.subtitle}>FORTUNE FAVOURS THE BOLD</Text>
          <View style={styles.divider} />
        </View>

        {/* Coin arena */}
        <View style={styles.coinArea}>
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
          <View style={styles.ring1} />
          <View style={styles.ring2} />

          <TouchableOpacity onPress={toss} activeOpacity={0.9} disabled={busy}>
            <Animated.View
              style={[
                styles.coinWrap,
                {
                  transform: [{ rotateY }, { translateY: bounceAnim }],
                },
              ]}>
              {/* HEADS — gold */}
              <Animated.View
                style={[
                  styles.coinFace,
                  styles.coinGold,
                  { opacity: headOpacity },
                ]}>
                <View
                  style={[
                    styles.innerRing,
                    { borderColor: 'rgba(255,240,160,0.4)' },
                  ]}
                />
                <View
                  style={[
                    styles.innerRing2,
                    { borderColor: 'rgba(201,168,76,0.35)' },
                  ]}
                />
                <Text style={styles.faceTopLabel}>· HEADS ·</Text>
                <Text style={styles.bigLetter}>H</Text>
                <Text style={styles.faceDots}>✦ ✦ ✦</Text>
                <Text style={styles.faceBottom}>OBVERSE</Text>
              </Animated.View>

              {/* TAILS — silver */}
              <Animated.View
                style={[
                  styles.coinFace,
                  styles.coinSilver,
                  styles.coinAbs,
                  { opacity: tailOpacity },
                ]}>
                <View
                  style={[
                    styles.innerRing,
                    { borderColor: 'rgba(220,232,245,0.4)' },
                  ]}
                />
                <View
                  style={[
                    styles.innerRing2,
                    { borderColor: 'rgba(136,152,168,0.35)' },
                  ]}
                />
                <Text style={[styles.faceTopLabel, { color: '#283040' }]}>
                  · TAILS ·
                </Text>
                <Text style={[styles.bigLetter, { color: '#283040' }]}>T</Text>
                <Text style={[styles.faceDots, { color: '#506070' }]}>
                  ◆ ◆ ◆
                </Text>
                <Text style={[styles.faceBottom, { color: '#283040' }]}>
                  REVERSE
                </Text>
              </Animated.View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Pedestal */}
        <View style={styles.pedestal} />

        {/* Result */}
        <Animated.View
          style={[
            styles.resultBlock,
            {
              opacity: resultOpacity,
              transform: [{ scale: resultScale }],
            },
          ]}>
          {result && (
            <>
              <View
                style={[
                  styles.badge,
                  result === 'Heads' ? styles.badgeH : styles.badgeT,
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    result === 'Heads' ? styles.badgeTextH : styles.badgeTextT,
                  ]}>
                  · {result.toUpperCase()} ·
                </Text>
              </View>
              <Text
                style={[
                  styles.resultBig,
                  result === 'Heads' ? styles.resultH : styles.resultT,
                ]}>
                {result}!
              </Text>
            </>
          )}
        </Animated.View>

        {/* Button */}
        <TouchableOpacity
          onPress={toss}
          disabled={busy}
          activeOpacity={0.8}
          style={styles.btnWrap}>
          <View style={[styles.btn, busy && { opacity: 0.35 }]}>
            <Text style={styles.btnText}>Toss</Text>
          </View>
        </TouchableOpacity>

        {/* Ratio bar */}
        {total > 0 && (
          <View style={styles.ratioWrap}>
            <View style={styles.ratioLabels}>
              <Text style={styles.ratioH}>Heads {headsPct}%</Text>
              <Text style={styles.ratioT}>{tailsPct}% Tails</Text>
            </View>
            <View style={styles.ratioTrack}>
              <View style={[styles.ratioFillH, { flex: headsPct }]} />
              <View style={[styles.ratioFillT, { flex: tailsPct }]} />
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View
            style={[styles.statCard, { borderColor: 'rgba(240,208,60,0.25)' }]}>
            <Text style={[styles.statNum, { color: '#F0D060' }]}>{heads}</Text>
            <Text style={styles.statLbl}>HEADS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#888' }]}>{total}</Text>
            <Text style={styles.statLbl}>TOTAL</Text>
          </View>
          <View
            style={[
              styles.statCard,
              { borderColor: 'rgba(196,181,253,0.25)' },
            ]}>
            <Text style={[styles.statNum, { color: '#C4B5FD' }]}>{tails}</Text>
            <Text style={styles.statLbl}>TAILS</Text>
          </View>
        </View>

        {/* History */}
        {history.length > 0 && (
          <View style={styles.histBlock}>
            <Text style={styles.histTitle}>HISTORY</Text>
            <View style={styles.histRow}>
              {history.map((x, i) => (
                <View
                  key={i}
                  style={[
                    styles.histDot,
                    x === 'H' ? styles.histDotH : styles.histDotT,
                    { opacity: Math.max(0.2, 1 - i * 0.055) },
                  ]}>
                  <Text
                    style={[
                      styles.histTxt,
                      { color: x === 'H' ? '#F0D060' : '#C4B5FD' },
                    ]}>
                    {x}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Donate */}
        <TouchableOpacity onPress={donate} activeOpacity={0.8} style={styles.donateWrap}>
          <View style={styles.donateBtn}>
            <Text style={styles.donateIcon}>♥</Text>
            <Text style={styles.donateTxt}>SUPPORT VIA GPAY</Text>
          </View>
          <Text style={styles.donateUpi}>prvbal-3@okicici</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const R = COIN_SIZE / 2;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e0c0a' },
  scroll: { alignItems: 'center', paddingTop: 56, paddingHorizontal: 20 },

  glowTop: {
    position: 'absolute',
    top: -60,
    left: '50%',
    marginLeft: -160,
    width: 320,
    height: 260,
    borderRadius: 160,
    backgroundColor: '#C9A84C',
    opacity: 0.07,
  },
  glowBot: {
    position: 'absolute',
    bottom: -80,
    left: '50%',
    marginLeft: -140,
    width: 280,
    height: 220,
    borderRadius: 140,
    backgroundColor: '#7060C0',
    opacity: 0.08,
  },
  bgDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C9A84C',
    opacity: 0.12,
  },

  titleBlock: { alignItems: 'center', marginBottom: 32, width: '100%' },
  divider: {
    width: 100,
    height: 1,
    backgroundColor: '#C9A84C',
    opacity: 0.35,
    marginVertical: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#F0D878',
    letterSpacing: 3,
  },
  subtitle: { fontSize: 10, color: '#7a6a40', letterSpacing: 4, marginTop: 4 },

  coinArea: {
    width: COIN_SIZE + 80,
    height: COIN_SIZE + 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  ripple: {
    position: 'absolute',
    width: COIN_SIZE + 16,
    height: COIN_SIZE + 16,
    borderRadius: (COIN_SIZE + 16) / 2,
    borderWidth: 2,
    borderColor: '#C9A84C',
  },
  ring1: {
    position: 'absolute',
    width: COIN_SIZE + 48,
    height: COIN_SIZE + 48,
    borderRadius: (COIN_SIZE + 48) / 2,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  ring2: {
    position: 'absolute',
    width: COIN_SIZE + 70,
    height: COIN_SIZE + 70,
    borderRadius: (COIN_SIZE + 70) / 2,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.08)',
  },

  coinWrap: { width: COIN_SIZE, height: COIN_SIZE },
  coinFace: {
    width: COIN_SIZE,
    height: COIN_SIZE,
    borderRadius: R,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    overflow: 'hidden',
  },
  coinGold: { backgroundColor: '#C9A84C', borderColor: '#6A4A00' },
  coinSilver: { backgroundColor: '#A0AABB', borderColor: '#384050' },
  coinAbs: { position: 'absolute', top: 0, left: 0 },

  innerRing: {
    position: 'absolute',
    width: COIN_SIZE * 0.82,
    height: COIN_SIZE * 0.82,
    borderRadius: COIN_SIZE * 0.41,
    borderWidth: 1,
  },
  innerRing2: {
    position: 'absolute',
    width: COIN_SIZE * 0.68,
    height: COIN_SIZE * 0.68,
    borderRadius: COIN_SIZE * 0.34,
    borderWidth: 0.5,
  },
  faceTopLabel: {
    fontSize: 10,
    color: '#6A4A00',
    letterSpacing: 4,
    fontWeight: '500',
    marginBottom: 2,
  },
  bigLetter: {
    fontSize: COIN_SIZE * 0.38,
    fontWeight: '700',
    color: '#6A4A00',
    opacity: 0.85,
    lineHeight: COIN_SIZE * 0.44,
  },
  faceDots: { fontSize: 12, color: '#8B6914', letterSpacing: 6, marginTop: 2 },
  faceBottom: {
    fontSize: 8,
    color: '#6A4A00',
    letterSpacing: 4,
    opacity: 0.7,
    marginTop: 4,
  },

  pedestal: {
    width: COIN_SIZE * 0.85,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(201,168,76,0.1)',
    marginBottom: 20,
  },

  resultBlock: {
    alignItems: 'center',
    minHeight: 82,
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeH: {
    backgroundColor: 'rgba(240,208,60,0.12)',
    borderColor: 'rgba(240,208,60,0.35)',
  },
  badgeT: {
    backgroundColor: 'rgba(196,181,253,0.1)',
    borderColor: 'rgba(196,181,253,0.3)',
  },
  badgeText: { fontSize: 10, letterSpacing: 3, fontWeight: '500' },
  badgeTextH: { color: '#F0D060' },
  badgeTextT: { color: '#C4B5FD' },
  resultBig: { fontSize: 44, fontWeight: '700', letterSpacing: 1 },
  resultH: { color: '#F0D060' },
  resultT: { color: '#C4B5FD' },

  btnWrap: { marginBottom: 24 },
  btn: {
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 50,
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.5)',
  },
  btnText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F0D060',
    letterSpacing: 2,
  },

  ratioWrap: { width: '100%', marginBottom: 20 },
  ratioLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  ratioH: { fontSize: 11, color: '#F0D060', letterSpacing: 1 },
  ratioT: { fontSize: 11, color: '#C4B5FD', letterSpacing: 1 },
  ratioTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  ratioFillH: { backgroundColor: '#F0D060', height: '100%' },
  ratioFillT: { backgroundColor: '#C4B5FD', height: '100%' },

  statsRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(201,168,76,0.15)',
    padding: 14,
    alignItems: 'center',
  },
  statNum: { fontSize: 30, fontWeight: '700', lineHeight: 34 },
  statLbl: { fontSize: 9, color: '#7a6a40', letterSpacing: 2, marginTop: 4 },

  histBlock: { width: '100%', alignItems: 'center', marginBottom: 8 },
  histTitle: {
    fontSize: 9,
    color: '#5a4a28',
    letterSpacing: 3,
    marginBottom: 10,
  },
  histRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  histDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  histDotH: {
    backgroundColor: 'rgba(240,208,60,0.15)',
    borderColor: 'rgba(240,208,60,0.3)',
  },
  histDotT: {
    backgroundColor: 'rgba(196,181,253,0.12)',
    borderColor: 'rgba(196,181,253,0.25)',
  },
  histTxt: { fontSize: 10, fontWeight: '500' },

  donateWrap: { alignItems: 'center', marginTop: 24, marginBottom: 8 },
  donateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: 'rgba(80,180,100,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(80,200,100,0.4)',
  },
  donateIcon: { fontSize: 16, color: '#60E080' },
  donateTxt: { fontSize: 13, fontWeight: '700', color: '#60E080', letterSpacing: 2 },
  donateUpi: { fontSize: 10, color: '#3a6a44', letterSpacing: 1, marginTop: 6 },
});
