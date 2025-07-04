import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Button, IconButton } from '@/components';
import { useAuth } from '@/providers';
import DatabaseService from '@/services/DatabaseService';
import {
  buttonStyles,
  containerStyles,
  globalStyles,
  textStyles,
} from '@/styles';
import { ContactInfo } from '@/types';

const Settings = () => {
  const { signOut, user } = useAuth();
  const isAdmin = user.role === 1 || user.role === 2;
  const router = useRouter();
  const [isEditable, setIsEditable] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [hasChanged, setHasChanged] = useState<boolean>(false);
  const database = DatabaseService.getInstance();

  useEffect(() => {
    void database.fetchContactInfo(setContactInfo);
    // NOTE: database is a singleton class provided by DatabaseService and
    // will never change; it does not need to be a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = () => {
    if (isEditable) {
      void database.updateContactInfo(contactInfo, hasChanged);
      setHasChanged(false);
    }
    setIsEditable(!isEditable);
  };

  return (
    <SafeAreaView style={containerStyles.wrapper}>
      <IconButton
        icon="log-out-outline"
        style={buttonStyles.smallButtonTopLeft}
        onPress={() => signOut(router)}
      />
      {isAdmin && (
        <Ionicons
          name="lock-closed"
          size={24}
          color="black"
          style={globalStyles.lockIcon}
        />
      )}
      <ScrollView contentContainerStyle={containerStyles.scrollView}>
        <View style={[containerStyles.card, { marginTop: '10%' }]}>
          <Text style={[textStyles.listTitle, { textAlign: 'center' }]}>
            Club Contact Information
          </Text>
          {isAdmin && (
            <Button
              onPress={handleEdit}
              style={buttonStyles.smallButtonTopRight}
            >
              <Text style={textStyles.smallButtonText}>
                {isEditable ? 'Save' : 'Edit'}
              </Text>
            </Button>
          )}

          {/* Loop to render subheading, normal text, or editable text */}
          {contactInfo.map((contact, index) => (
            <View key={index} style={containerStyles.closeRowStack}>
              <View style={containerStyles.rowContainer}>
                {isAdmin && isEditable ? (
                  <View style={containerStyles.inputContainer}>
                    <TextInput
                      style={textStyles.input}
                      value={contact.name}
                      onChangeText={(newText) =>
                        database.handleTextChange(
                          index,
                          'name',
                          newText,
                          contactInfo,
                          setContactInfo,
                          setHasChanged,
                        )
                      }
                      placeholder="Enter Name"
                    />
                  </View>
                ) : (
                  <Text style={textStyles.detail}>{contact.name}</Text>
                )}
              </View>
              <View style={containerStyles.rowContainer}>
                {isAdmin && isEditable ? (
                  <View style={containerStyles.inputContainer}>
                    <TextInput
                      style={textStyles.input}
                      value={contact.email}
                      onChangeText={(newText) =>
                        database.handleTextChange(
                          index,
                          'email',
                          newText,
                          contactInfo,
                          setContactInfo,
                          setHasChanged,
                        )
                      }
                      placeholder="Enter Email"
                    />
                  </View>
                ) : (
                  <Text style={textStyles.detail}>{contact.email}</Text>
                )}
              </View>
              <View style={containerStyles.rowContainer}>
                {isAdmin && isEditable && (
                  <Button
                    onPress={() =>
                      database.deleteContact(
                        index,
                        contactInfo,
                        setContactInfo,
                        setHasChanged,
                      )
                    }
                    style={[buttonStyles.button, { backgroundColor: 'red' }]}
                  >
                    <Text style={textStyles.smallButtonText}>
                      Delete Above Contact
                    </Text>
                  </Button>
                )}
              </View>
            </View>
          ))}
          <View style={containerStyles.rowStack}>
            {isAdmin && isEditable ? (
              <Button
                style={buttonStyles.button}
                onPress={() =>
                  database.addContact(
                    contactInfo,
                    setContactInfo,
                    setHasChanged,
                  )
                }
              >
                <Text style={textStyles.smallButtonText}>Add Contact</Text>
              </Button>
            ) : null}
          </View>
        </View>
      </ScrollView>
      {isAdmin ? (
        <Button onPress={() => router.push('/settings/manage_users')}>
          Manage Users
        </Button>
      ) : null}
      {isAdmin ? (
        <Button onPress={() => router.push('/settings/manage_whitelist')}>
          Manage Whitelist
        </Button>
      ) : null}
    </SafeAreaView>
  );
};

export default Settings;
