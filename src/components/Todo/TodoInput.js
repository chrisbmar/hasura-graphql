import React, { useState } from "react";
import PropTypes from "prop-types";
import { useMutation, gql } from "@apollo/client";
import { GET_MY_TODOS } from "./TodoPrivateList";

const ADD_TODO = gql`
  mutation($todo: String!, $isPublic: Boolean!) {
    insert_todos(objects: { title: $todo, is_public: $isPublic }) {
      affected_rows
      returning {
        id
        title
        created_at
        is_completed
      }
    }
  }
`;

const TodoInput = ({ isPublic = false }) => {
  const [todoInput, setTodoInput] = useState("");

  const updateCache = (cache, { data }) => {
    if (isPublic) {
      return null;
    }

    const existingTodos = cache.readQuery({
      query: GET_MY_TODOS
    });

    const newTodo = data.insert_todos.returning[0];
    cache.writeQuery({
      query: GET_MY_TODOS,
      data: { todos: [newTodo, ...existingTodos] }
    });
  };

  const resetInput = () => setTodoInput("");

  const [addTodo] = useMutation(ADD_TODO, {
    update: updateCache,
    onCompleted: resetInput
  });

  const onSubmit = e => {
    e.preventDefault();
    addTodo({ variables: { todo: todoInput, isPublic } });
  };

  return (
    <form className="formInput" onSubmit={onSubmit}>
      <input
        className="input"
        placeholder="What needs to be done?"
        value={todoInput}
        onChange={e => setTodoInput(e.target.value)}
      />
      <i className="inputMarker fa fa-angle-right" />
    </form>
  );
};

TodoInput.propTypes = {
  isPublic: PropTypes.bool
};

export default TodoInput;
