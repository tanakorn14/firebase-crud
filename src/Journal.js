import { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import Table from "react-bootstrap/Table";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Select from "react-select";
import { format } from "date-fns";
import { BsPlus, BsTrash, BsPencil, BsFileEarmarkDiff } from "react-icons/bs";
import { useForm } from "react-hook-form";

// Firebase
import { useCollectionData } from "react-firebase-hooks/firestore";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseUrl: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
  });
}
const firestore = firebase.firestore();
const auth = firebase.auth();
const newCategory = "";

export default function Journal() {
  const [categories, setCategories] = useState([]);
  const [iCategories, setICategories] = useState([]);
  const [selectCate, setSelectCate] = useState("");
  const [fiterCate, setCates] = useState();
  const [category, setCategory] = useState();
  const [editCategoryMode, setEditCategoryMode] = useState(false);
  const { register, handleSubmit } = useForm();
  const [showForm, setShowForm] = useState(false);
  const [showCategory, setCategoryForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [newCategory, setNewCategory] = useState({
    id: null,
    name: "",
    createdAt: new Date(),
  });
  const [tempData, setTempData] = useState({
    id: null,
    createdAt: new Date(),
    description: "",
    amount: 0,
    category: categories[0],
  });

  const handleFilterCate = (event) => {
    const { value } = event.target;
    if (data) {
      // Guard condition
      const journals = manipulateJournals(data, fiterCate);
      let t = 0;
      let filteredData = journals.filter(
        (d) => value == "" || d.category == value
      );
      let r = filteredData.map((d, i) => {
        console.log("filter", d);
        t += d.amount;
        return (
          <JournalRow
            data={d}
            i={i}
            onDeleteClick={handleDeleteClick}
            onEditClick={handleEditClick}
          />
        );
      });
      setRecords(r);
      setTotal(t);
    }

    console.log(`Checking Cate ID: `, value);
    setSelectCate(value);
  };

  // Firebase stuff
  const categoryRef = firestore.collection("category");
  const categoryQuery = categoryRef.orderBy("name", "desc");
  const [cate] = useCollectionData(categoryQuery, { idField: "id" });
  const moneyRef = firestore.collection("money");
  const query = moneyRef.orderBy("createdAt", "asc").limitToLast(100);
  const [data] = useCollectionData(query, { idField: "id" });

  console.log("REACT_APP_PROJECT_ID", process.env.REACT_APP_PROJECT_ID);

  // This will be run when 'data' is changed.
  useEffect(() => {
    if (cate) {
      let c = cate.map((d, i) => {
        console.log("cate name", d.name);
        return <CategoryRow data={d} i={i} />;
      });
      let options = cate.map((item, index) => (
        <option key={`category-${index}`} value={item.id}>
          {item.name}
        </option>
      ));
      options.unshift(
        <option key={`category-${0}`} value={""}>
          -- All --
        </option>
      );
      setCates(cate);
      setCategories(options);
      let newOptions = [...options];
      newOptions.shift();
      newOptions.unshift(
        <option key={`category-${0}`} value={""}>
          Uncategorised
        </option>
      );
      setICategories(newOptions);

      if (data) {
        console.log(`Checking Data`, data);
        const journals = manipulateJournals(data, cate);
        console.log(`Checking journals`, journals);
        // Guard condition
        let t = 0;
        let r = journals.map((d, i) => {
          t += d.amount;
          return (
            <JournalRow
              data={d}
              i={i}
              onDeleteClick={handleDeleteClick}
              onEditClick={handleEditClick}
            />
          );
        });
        setRecords(r);
        setTotal(t);
      }
    }
  }, [data, cate]);

  const manipulateJournals = (data, cates) => {
    console.log(`Checking cates`, cates);
    let tempList = [];
    data.forEach((item) => {
      const category = cates.filter((cate) => item.category === cate.id)[0];
      if (category !== undefined) {
        const current = {
          ...item,
          categoryName: category.name,
        };
        tempList.push(current);
      } else {
        const current = {
          ...item,
          category: "",
          categoryName: "Uncategorised",
        };
        tempList.push(current);
      }
    });
    return tempList;
  };

  const handleCategoryFilterChange = (obj) => {
    console.log("filter", obj);
    if (data) {
      // Guard condition
      let t = 0;
      let filteredData = data.filter(
        (d) => obj.id == 0 || d.category.id == obj.id
      );
      let r = filteredData.map((d, i) => {
        console.log("filter", d);
        t += d.amount;
        return <JournalRow data={d} i={i} />;
      });
      setRecords(r);
      setTotal(t);
    }
  };

  // Handlers for Modal Add Form
  const handleshowForm = () => setShowForm(true);

  // Handlers for Modal Add Form
  const handleCloseForm = () => {
    setTempData({
      id: null,
      createdAt: new Date(),
      description: "",
      amount: 0,
      category: categories[0],
    });
    setCategory({});
    setShowForm(false);
    setEditMode(false);
  };

  // Handle Add Form submit
  const onSubmit = async (data) => {
    let preparedData = {
      // ...data,
      description: data.description,
      amount: parseFloat(data.amount),
      createdAt: new Date(data.createdAt),
      category: category,
    };
    console.log("onSubmit", preparedData);

    if (editMode) {
      // Update record
      console.log("UPDATING!!!!", data.id);
      await moneyRef
        .doc(data.id)
        .set(preparedData)
        .then(() => console.log("moneyRef has been set"))
        .catch((error) => {
          console.error("Error: ", error);
          alert(error);
        });
    } else {
      // Add to firebase
      // This is asynchronous operation,
      // JS will continue process later, so we can set "callback" function
      // so the callback functions will be called when firebase finishes.
      // Usually, the function is called "then / error / catch".
      await moneyRef
        .add(preparedData)
        .then(() => console.log("New record has been added."))
        .catch((error) => {
          console.error("Errror:", error);
          alert(error);
        });
      // setShowForm(false)
    }
    handleCloseForm();
  };

  const handleCategoryChange = (obj) => {
    console.log("handleCategoryChange 1", obj);
    const { value } = obj.target;
    console.log("handleCategoryChange 2", value);
    setCategory(value);
  };

  const handleDeleteClick = (id) => {
    console.log("handleDeleteClick in Journal", id);
    if (window.confirm("Are you sure to delete this record?"))
      moneyRef.doc(id).delete();
  };

  const handleEditClick = (data) => {
    let preparedData = {
      id: data.id,
      description: data.description,
      amount: parseFloat(data.amount),
      createdAt: data.createdAt.toDate(),
      category: category,
    };
    console.log("handleEditClick", preparedData);
    // expect original data type for data.createdAt is Firebase's timestamp
    // convert to JS Date object and put it to the same field
    // if ('toDate' in data.createdAt) // guard, check wther toDate() is available in createdAt object.
    //   data.createdAt = data.createdAt.toDate()

    setTempData(preparedData);
    setCategory(data.category);
    setShowForm(true);
    setEditMode(true);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Journal</h1>
          <Button
            className="ml-5 ml-lg-0"
            variant="secondary"
            style={{
              margin: "0%",
            }}
            onClick={handleshowForm}
          >
            <BsPlus /> Add
          </Button>
        </Col>
        <Col>
          Category:
          <Col className="md-2 float-right">
            <select
              className="form-select"
              aria-label="Default select example"
              name="categories"
              style={{ width: 200, height: 30 }}
              onChange={(e) => handleFilterCate(e)}
            >
              {categories}
            </select>
          </Col>
        </Col>
      </Row>
      <Table className="mt-2" striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>{records}</tbody>
        <tfooter>
          <td colSpan={5}>
            <h2>Total: {total}</h2>
          </td>
        </tfooter>
      </Table>
      {/* Form add new activity */}
      <Modal
        show={showForm}
        onHide={handleCloseForm}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="hidden"
            placeholder="ID"
            ref={register}
            name="id"
            id="id"
            defaultValue={tempData.id}
          />
          <Modal.Header closeButton>
            <Modal.Title>
              {editMode ? "Edit Record" : "Add New Record"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col>
                <label htmlFor="createdAt">Date</label>
              </Col>
              <Col>
                <input
                  type="date"
                  placeholder="Date"
                  ref={register}
                  name="createdAt"
                  id="createdAt"
                  defaultValue={format(tempData.createdAt, "yyyy-MM-dd")}
                />
              </Col>
            </Row>

            <Row>
              <Col>
                <label htmlFor="category">Category</label>
              </Col>
              <Col className="md-2 float-right">
                <select
                  className="form-select"
                  aria-label="Default select example"
                  value={category}
                  name="categories"
                  style={{ width: 175, height: 30 }}
                  required
                  onChange={handleCategoryChange}
                >
                  {iCategories}
                </select>
              </Col>
            </Row>

            <Row>
              <Col>
                <label htmlFor="description">Description</label>
              </Col>
              <Col>
                <input
                  type="text"
                  placeholder="Description"
                  ref={register}
                  name="description"
                  id="description"
                  required
                  defaultValue={tempData.description}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <label htmlFor="amount">Amount</label>
              </Col>
              <Col>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Amount"
                  ref={register}
                  name="amount"
                  id="amount"
                  required
                  defaultValue={tempData.amount}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseForm}>
              Close
            </Button>
            <Button variant={editMode ? "success" : "primary"} type="submit">
              {editMode ? "Save Record" : "Add Record"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </Container>
  );
}

function JournalRow(props) {
  let d = props.data;
  let i = props.i;
  // console.log("JournalRow", d)
  let cate = "";

  return (
    <tr>
      <td>
        <BsTrash onClick={() => props.onDeleteClick(d.id)} />
        <BsPencil onClick={() => props.onEditClick(d)} />
      </td>
      <td>{format(d.createdAt.toDate(), "yyyy-MM-dd")}</td>
      <td>{d.description}</td>
      <td>{d.categoryName}</td>
      <td>{d.amount}</td>
    </tr>
  );
}

function CategoryRow(props) {
  let d = props.data;
  let i = props.i;
  return (
    <tr>
      <td>
        <BsTrash onClick={() => props.onDeleteClick(d.id)} />
        <BsPencil onClick={() => props.onEditClick(d)} />
      </td>
      <option></option>
    </tr>
  );
}