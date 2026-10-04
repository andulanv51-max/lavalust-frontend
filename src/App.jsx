import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || ''

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token'))

  const [products, setProducts] = useState([])

  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')

  const [editingId, setEditingId] = useState(null)

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault()

    setMessage('Logging in...')

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Login failed')
        return
      }

      localStorage.setItem('token', data.token)
      setToken(data.token)

      setMessage('')
    } catch (error) {
      console.error(error)
      setMessage('Cannot connect to the API')
    }
  }

  // =========================
  // GET PRODUCTS
  // =========================

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Failed to get products')
        return
      }

      if (Array.isArray(data)) {
        setProducts(data)
      } else if (Array.isArray(data.products)) {
        setProducts(data.products)
      } else if (Array.isArray(data.data)) {
        setProducts(data.data)
      } else {
        setProducts([])
      }
    } catch (error) {
      console.error(error)
      setMessage('Cannot connect to the API')
    }
  }

  useEffect(() => {
    if (token) {
      fetchProducts()
    }
  }, [token])

  // =========================
  // ADD PRODUCT
  // =========================

  const handleAddProduct = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_name: productName,
          description: description,
          price: price,
          quantity: quantity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Failed to add product')
        return
      }

      setProductName('')
      setDescription('')
      setPrice('')
      setQuantity('')

      setMessage('Product added successfully!')

      fetchProducts()
    } catch (error) {
      console.error(error)
      setMessage('Cannot connect to the API')
    }
  }

  // =========================
  // EDIT PRODUCT
  // =========================

  const handleEdit = (product) => {
    setEditingId(product.id)

    setProductName(
      product.product_name ||
        product.name ||
        ''
    )

    setDescription(product.description || '')

    setPrice(product.price || '')

    setQuantity(
      product.quantity ||
        product.stock ||
        ''
    )

    setMessage('')
  }

  // =========================
  // CANCEL EDIT
  // =========================

  const handleCancelEdit = () => {
    setEditingId(null)
    setProductName('')
    setDescription('')
    setPrice('')
    setQuantity('')
    setMessage('')
  }

  // =========================
  // UPDATE PRODUCT
  // =========================

  const handleUpdateProduct = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(
        `${API_URL}/api/products/${editingId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_name: productName,
            description: description,
            price: price,
            quantity: quantity,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(
          data.message ||
            'Failed to update product'
        )
        return
      }

      setEditingId(null)

      setProductName('')
      setDescription('')
      setPrice('')
      setQuantity('')

      setMessage(
        'Product updated successfully!'
      )

      fetchProducts()
    } catch (error) {
      console.error(error)
      setMessage('Cannot connect to the API')
    }
  }

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(
          data.message ||
            'Failed to delete product'
        )
        return
      }

      setMessage(
        'Product deleted successfully!'
      )

      fetchProducts()
    } catch (error) {
      console.error(error)
      setMessage('Cannot connect to the API')
    }
  }

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem('token')

    setToken(null)
    setProducts([])

    setUsername('')
    setPassword('')

    setProductName('')
    setDescription('')
    setPrice('')
    setQuantity('')

    setEditingId(null)
    setMessage('')
  }

  // =========================
  // LOGIN PAGE
  // =========================

  if (!token) {
    return (
      <div className="login-container">

        <div className="login-card">

          <h1>
            Product Management System
          </h1>

          <h2>Login</h2>

          <form onSubmit={handleLogin}>

            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
            />

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            <button type="submit">
              Login
            </button>

          </form>

          {message && (
            <p className="message">
              {message}
            </p>
          )}

        </div>

      </div>
    )
  }

  // =========================
  // PRODUCT PAGE
  // =========================

  return (
    <div className="dashboard">

      <header className="navbar">

        <h1>
          Product Management System
        </h1>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      <main className="content">

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        {/* ADD / EDIT PRODUCT */}

        <section className="add-product">

          <form
            className="add-product-form"
            onSubmit={
              editingId
                ? handleUpdateProduct
                : handleAddProduct
            }
          >

            <div className="form-group">

              <label>
                Product Name
              </label>

              <input
                type="text"
                value={productName}
                onChange={(e) =>
                  setProductName(e.target.value)
                }
                required
              />

            </div>

            <div className="form-group">

              <label>
                Description
              </label>

              <input
                type="text"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                required
              />

            </div>

            <div className="form-group">

              <label>
                Price
              </label>

              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                required
              />

            </div>

            <div className="form-group">

              <label>
                Quantity
              </label>

              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                required
              />

            </div>

            <button
              className="add-button"
              type="submit"
            >
              {editingId
                ? 'Update Product'
                : 'Add Product'}
            </button>

            {editingId && (
              <button
                type="button"
                className="delete-button"
                onClick={handleCancelEdit}
              >
                Cancel Edit
              </button>
            )}

          </form>

        </section>

        {/* PRODUCT LIST */}

        <section className="products-section">

          <h2>
            Product List
          </h2>

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Product Name</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {products.map((product) => (

                  <tr key={product.id}>

                    <td>
                      {product.id}
                    </td>

                    <td>
                      {product.product_name ||
                        product.name ||
                        'N/A'}
                    </td>

                    <td>
                      {product.description}
                    </td>

                    <td>
                      ₱
                      {Number(
                        product.price || 0
                      ).toFixed(2)}
                    </td>

                    <td>
                      {product.quantity ||
                        product.stock ||
                        0}
                    </td>

                    <td>

                      <button
                        className="edit-button"
                        onClick={() =>
                          handleEdit(product)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(product.id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  )
}

export default App