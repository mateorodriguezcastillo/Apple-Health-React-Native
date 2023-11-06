/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from 'react-native-health';

/* Permission options */
const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.StepCount,
    ],
  },
} as HealthKitPermissions;

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [hrv, setHrv] = React.useState<number>(0);
  const [steps, setSteps] = React.useState<number>(0);
  const [sleep, setSleep] = React.useState<number>(0);

  AppleHealthKit.initHealthKit(permissions, (error: string) => {
    /* Called after we receive a response from the system */

    if (error) {
      console.log('[ERROR] Cannot grant permissions!');
    }

    /* Can now read or write to HealthKit */

    const options = {
      startDate: new Date(2020, 1, 1).toISOString(),
    };

    AppleHealthKit.getDailyStepCountSamples(
      options,
      (callbackError: string, results: HealthValue[]) => {
        if (callbackError) {
          console.log(callbackError);
          return;
        }
        setSteps(results[0].value);
        console.log('Steps: ', results[0].value);
      },
    );

    AppleHealthKit.getHeartRateVariabilitySamples(
      options,
      (callbackError: string, results: HealthValue[]) => {
        if (callbackError) {
          console.log(callbackError);
          return;
        }
        setHrv(Math.floor(results[0].value * 1000));
        console.log('HRV: ', results[0].value);
      },
    );

    AppleHealthKit.getSleepSamples(
      options,
      (callbackError: string, results: HealthValue[]) => {
        if (callbackError) {
          console.log(callbackError);
          return;
        }
        const bedTime =
          (new Date(results[0].endDate) - new Date(results[0].startDate)) /
          1000 /
          60 /
          60;
        setSleep(bedTime);
        console.log('Sleep: ', bedTime);
      },
    );
  });

  console.log(hrv);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="HRV">
            Your last HRV is: <Text style={styles.highlight}>{hrv}</Text>
          </Section>
          <Section title="Steps">
            Your today step count is:{' '}
            <Text style={styles.highlight}>{steps}</Text>
          </Section>
          <Section title="Sleep">
            You spend <Text style={styles.highlight}>{sleep}</Text> hours in bed
            today.
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
