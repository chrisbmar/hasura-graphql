import React, { useState } from "react";
import PropTypes from "prop-types";
import { useQuery, useMutation, gql } from "@apollo/client";

import TodoItem from "./TodoItem";
import TodoFilters from "./TodoFilters";

const GET_MY_TODOS = gql`
  query getMyTodos {
    todos(
      where: { is_public: { _eq: false } }
      order_by: { created_at: desc }
    ) {
      id
      title
      created_at
      is_completed
    }
  }
`;

const CLEAR_COMPLETED = gql`
  mutation clearCompleted {
    delete_todos(
      where: { is_completed: { _eq: true }, is_public: { _eq: false } }
    ) {
      affected_rows
    }
  }
`;

const TodoPrivateList = ({ todos }) => {
  const [state, setState] = useState({
    filter: "all",
    clearInProgress: false
  });

  const filterResults = filter => {
    setState({
      ...state,
      filter: filter
    });
  };

  const [clearCompletedTodos] = useMutation(CLEAR_COMPLETED);

  const clearCompleted = () => {
    clearCompletedTodos({
      optimisticResponse: true,
      update: cache => {
        const existingTodos = cache.readQuery({ query: GET_MY_TODOS });
        const newTodos = existingTodos.todos.filter(t => !t.is_completed);
        cache.writeQuery({ query: GET_MY_TODOS, data: { todos: newTodos } });
      }
    });
  };

  let filteredTodos = todos;
  if (state.filter === "active") {
    filteredTodos = todos.filter(todo => todo.is_completed !== true);
  } else if (state.filter === "completed") {
    filteredTodos = todos.filter(todo => todo.is_completed === true);
  }

  const todoList = [];
  filteredTodos.forEach((todo, index) => {
    todoList.push(<TodoItem key={index} index={index} todo={todo} />);
  });

  return (
    <>
      <div className="todoListWrapper">
        <ul>{todoList}</ul>
      </div>

      <TodoFilters
        todos={filteredTodos}
        currentFilter={state.filter}
        filterResultsFn={filterResults}
        clearCompletedFn={clearCompleted}
        clearInProgress={state.clearInProgress}
      />
    </>
  );
};

const TodoPrivateListQuery = () => {
  const { loading, error, data } = useQuery(GET_MY_TODOS);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    console.error(error);
    return <div>Error!</div>;
  }
  return <TodoPrivateList todos={data.todos} />;
};

TodoPrivateList.propTypes = {
  todos: PropTypes.array.isRequired
};

export default TodoPrivateListQuery;
export { GET_MY_TODOS };
