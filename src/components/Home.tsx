import { useState, useEffect } from "react"
import {
  Container,
  Row,
  Col,
  Form,
  FormControl,
  ListGroup,
} from "react-bootstrap"
import { io } from 'socket.io-client'
import { User, Message } from '../types'



const socket = io("http://localhost:3001", { transports: ['websocket'] }) 

const Home = () => {
  const [username, setUsername] = useState("")
  const [message, setMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [loggedIn, setLoggedIn] = useState(false)
  const [chatHistory, setChatHistory] = useState<Message[]>([])

  useEffect(() => {
 
    socket.on("welcome", welcomeMessage => {
      console.log(welcomeMessage)

      socket.on("loggedIn", onlineUsersList => {
        console.log(onlineUsersList)
        setOnlineUsers(onlineUsersList)
        setLoggedIn(true)
      })

      socket.on("updateOnlineUsersList", updatedList => {
        setOnlineUsers(updatedList)
      })

      socket.on("newMessage", newMessage => {
        console.log(newMessage)
     
        setChatHistory((chatHistory) => [...chatHistory, newMessage.message])
      })
    })
  }, [])

  const submitUsername = () => {

    socket.emit("setUsername", { username })
  }

  const sendMessage = () => {
    const newMessage = {
      sender: username,
      text: message,
      createdAt: new Date().toLocaleString("en-US")
    }
    socket.emit("sendMessage", { message: newMessage })
    setChatHistory([...chatHistory, newMessage])
  }

  return (
    <Container fluid>
      <Row style={{ height: "95vh" }} className="my-3">
        <Col md={9} className="d-flex flex-column justify-content-between">
    
          <Form
            onSubmit={e => {
              e.preventDefault()
              submitUsername()
            }}
          >
            <FormControl
              placeholder="Set your username here"
              value={username}
              onChange={e => setUsername(e.target.value)}
              disabled={loggedIn}
            />
          </Form>

          <ListGroup>
            {chatHistory.map((message, index) => (<ListGroup.Item key={index}>{<strong>{message.sender} </strong>} | {message.text} at {message.createdAt}</ListGroup.Item>))}
          </ListGroup>

          <Form
            onSubmit={e => {
              e.preventDefault()
              sendMessage()
            }}
          >
            <FormControl
              placeholder="Write your message here"
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={!loggedIn}
            />
          </Form>
        </Col>
        <Col md={3}>

          <div className="mb-3">Connected users:</div>
          {onlineUsers.length === 0 && (
            <ListGroup.Item>Log in to check who's online!</ListGroup.Item>
          )}
          <ListGroup>
            {onlineUsers.map(user => (<ListGroup.Item key={user.socketId}>{user.username}</ListGroup.Item>))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}

export default Home