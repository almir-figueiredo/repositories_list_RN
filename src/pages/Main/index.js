/* eslint-disable react/static-property-placement */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable react/jsx-no-undef */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Keyboard, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/AntDesign';
import api from '../../services/api';

import {
  Container,
  Form,
  Input,
  SubmitButton,
  List,
  User,
  Avatar,
  Name,
  Bio,
  ProfileButton,
  ProfileButtonText,
  DeleteButton,
  DeleteButtonText,
} from './styles';

export default class Main extends Component {
  // sempre que tiver state dentro do componente, ele precisa ser escrito no
  // formato de classe e o return tem que ir para dentro de método
  // render().

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    newUser: '',
    users: [],
    loading: false,
  };

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { users } = this.state;

    if (prevState.users !== users) {
      AsyncStorage.setItem('users', JSON.stringify(users));
    }
  }

  handleAddUser = async () => {
    const { users, newUser } = this.state;

    this.setState({ loading: true });

    const response = await api.get(`/users/${newUser}`);

    const data = {
      name: response.data.name,
      login: response.data.login,
      bio: response.data.bio,
      avatar: response.data.avatar_url,
    };
    this.setState({
      newUser: '',
      users: [...users, data],
      loading: false,
      // os três pontos significam todas as posições da
      // array que já estão gravadas, neste caso, todos
      // os usuários já cadastrados.
    });
    Keyboard.dismiss();
  };

  handleDelete = user => {
    this.setState({
      newUser: '',
      users: this.state.users.filter(u => u !== user),
    });
  };

  handleNavigate = user => {
    const { navigation } = this.props;
    navigation.navigate('User', { user });
  };

  static navigationOptions = {
    title: 'Usuários',
  };

  render() {
    const { users, newUser, loading } = this.state;
    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Adicionar usuário"
            valor={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
          />
          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Icon name="adduser" size={20} color="#FFF" />
            )}
          </SubmitButton>
        </Form>

        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>
              <>
                <ProfileButton onPress={() => this.handleNavigate(item)}>
                  <ProfileButtonText>Ver Perfil</ProfileButtonText>
                </ProfileButton>
                <DeleteButton onPress={() => this.handleDelete(item)}>
                  <DeleteButtonText>Deletar Usuário</DeleteButtonText>
                </DeleteButton>
              </>
            </User>
          )}
        />
      </Container>
    );
  }
}
