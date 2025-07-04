import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text } from 'react-native';

import { useRouter } from 'expo-router';

import { BackButton, Button, SnackbarMessage } from '@/components';
import { StationForm } from '@/forms';
import { CatalogImageHandler } from '@/image_handlers/CatalogImageHandler';
import { useAuth } from '@/providers';
import DatabaseService from '@/services/DatabaseService';
import { getSelectedStation, setSelectedStation } from '@/stores/stationStores';
import { buttonStyles, containerStyles, textStyles } from '@/styles';
import { Station } from '@/types';

const EditStation = () => {
  const router = useRouter();
  const { user } = useAuth();
  const database = DatabaseService.getInstance();
  const [visible, setVisible] = useState<boolean>(false);
  const station = getSelectedStation();

  const [profile, setProfile] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isPicsChanged, setPicsChanged] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: station.name,
    location: station.location,
    lastStocked: station.lastStocked,
    stockingFreq: station.stockingFreq,
    knownCats: station.knownCats,
  });
  const imageHandler = new CatalogImageHandler({
    type: 'stations',
    id: station.id,
    photos,
    profile,
    setPhotos,
    setProfile,
    setPicsChanged,
    setVisible,
  });

  useEffect(() => {
    void database.fetchStationImages(station.id, setProfile, setPhotos);
    // NOTE: database is a singleton class provided by DatabaseService and
    // will never change; it does not need to be a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createObj = () => {
    const newStation = new Station({
      id: station.id,
      name: formData.name,
      location: formData.location,
      lastStocked: formData.lastStocked,
      stockingFreq: formData.stockingFreq,
      knownCats: formData.knownCats,
      isStocked: Station.calculateStocked(
        formData.lastStocked,
        formData.stockingFreq,
      ),
      createdBy: user,
    });
    setSelectedStation(newStation);
  };

  return (
    <SafeAreaView style={containerStyles.wrapper}>
      <BackButton />
      <SnackbarMessage
        text="Saving Station..."
        visible={visible}
        setVisible={setVisible}
      />
      <Text style={textStyles.pageTitle}>Edit Station</Text>
      <ScrollView contentContainerStyle={containerStyles.scrollView}>
        <StationForm
          formData={formData}
          setFormData={setFormData}
          photos={photos}
          profile={profile}
          setPhotos={setPhotos}
          setPicsChanged={setPicsChanged}
          imageHandler={imageHandler}
          isCreate={false}
        />
      </ScrollView>
      <Button
        style={buttonStyles.bigButton}
        onPress={() => {
          createObj();
          void database.saveStation(
            profile,
            photos,
            isPicsChanged,
            setVisible,
            router,
          );
        }}
      >
        <Text style={textStyles.bigButtonText}> Save Station</Text>
      </Button>
      <Button
        style={buttonStyles.bigDeleteButton}
        onPress={() => database.deleteStation(setVisible, router)}
      >
        <Text style={textStyles.bigButtonText}>Delete Station</Text>
      </Button>
    </SafeAreaView>
  );
};
export default EditStation;
