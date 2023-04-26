let userNameInput = document.querySelector("#username");
let passwordInput = document.querySelector("#password");
let loginDiv = document.querySelector("#loginDiv");
let getUsersBtn = document.querySelector("#getUsers");
let registerBtn = document.querySelector("#register");
let registerNewUser = document.querySelector("#registerNewUser");
let registerDiv = document.querySelector("#registerDiv");
let registerUsername = document.querySelector("#registerUsername");
let registerPassword = document.querySelector("#registerPassword");
let registerEmail = document.querySelector("#registerEmail");
let loginBtn = document.querySelector("#login");
let startLoginBtn = document.querySelector("#startLogin");
let startLogoutBtn = document.querySelector("#startLogout");
let welcomeP = document.querySelector("#welcomeUser");
let main = document.querySelector("#displayBooks");
let toRead = document.querySelector("#toRead");
let books = document.querySelector("#books-list");
let ratedBooks = document.querySelector("#ratedBooks");
let ratedTitleBtn = document.querySelector("#ratedTitle");
let ratedAuthorBtn = document.querySelector("#ratedAuthor");
let ratedRatingBtn = document.querySelector("#ratedRating");


let loggedIn = () => {
  if (sessionStorage.getItem("token")) {
    loginDiv.classList.add("hidden");
    registerDiv.classList.add("hidden");
    startLoginBtn.classList.add("hidden");
    // welcomeP.innerText =
    //   "You are logged in as " + sessionStorage.getItem("userName");
  } else {
    loginDiv.classList.add("hidden");
    registerDiv.classList.add("hidden");
    startLogoutBtn.classList.add("hidden");
  }
};
loggedIn();

let login = async () => {
  let response = await axios.post("http://localhost:1338/api/auth/local", {
    identifier: userNameInput.value,
    password: passwordInput.value,
  });
  console.log(response.data);
  let data = response.data;
  sessionStorage.setItem("token", data.jwt);
  sessionStorage.setItem("loginId", response.data.user.id);
  sessionStorage.setItem("userName", response.data.user.username);
  userId = response.data.user.id;
  welcomeP.innerText = "You are logged in as " + data.user.username;
  loginDiv.classList.add("hidden");
  startLogoutBtn.classList.remove("hidden");
  getBooks();
};

let registerUser = async () => {
  let response = await axios.post(
    "http://localhost:1338/api/auth/local/register",
    {
      username: registerUsername.value,
      password: registerPassword.value,
      email: registerEmail.value,
    }
  );
  let data = response.data;
  sessionStorage.setItem("token", data.jwt);
  sessionStorage.setItem("loginId", response.data.user.id);
  sessionStorage.setItem("userName", response.data.user.username);
  welcomeP.innerText = "You are logged in as " + data.user.username;
  loginDiv.classList.add("hidden");
  startLogoutBtn.classList.remove("hidden");
};

let register = () => {
  loginDiv.classList.add("hidden");
  registerDiv.classList.remove("hidden");
};

let logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("loginId");
  sessionStorage.removeItem("userName");
  welcomeP.innerText = "You are logged out";
  loginDiv.classList.remove("hidden");
  startLogoutBtn.classList.add("hidden");
};

registerBtn.addEventListener("click", register);
registerNewUser.addEventListener("click", registerUser);
startLoginBtn.addEventListener("click", () => {
  loginDiv.classList.remove("hidden");
});

// logut
startLogoutBtn.addEventListener("click", () => {
  logout();
  books.innerHTML = "";
  getBooks();
  location.reload();
});

/* Login */
loginBtn.addEventListener("click", () => {
  login();
  books.innerHTML = "";
  startLoginBtn.classList.add("hidden");
  getBooks();
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get data from Strapi

const getBooks = async () => {
  try {
    const response = await axios.get("http://localhost:1338/api/books?populate=deep,3");
    const data = response.data.data;
    
    displayBooks(data);
  } catch (error) {
    console.log(error);
  }
};
  
  getBooks();

  const displayBooks = (books) => {
    // Sort the books by their ID in ascending order
    books.sort((a, b) => a.id - b.id);

    const booksContainer = document.getElementById("books-container");
  
    books.forEach((book) => {
      const bookDiv = createBookDiv(book);
      if (bookDiv) {
        booksContainer.appendChild(bookDiv);
      }
    });
  };

  const getBookCover = async (bookId) => {
    try {
      const response = await axios.get(`http://localhost:1338/api/books/${bookId}/cover`);
      const coverUrl = response.data.data[0].attributes.url;
      return coverUrl;
    } catch (error) {
      console.log(`Error fetching book cover: ${error}`);
      return null;
    }    
  };

  

  const createBookDiv = (book) => {
    try {
      const bookDiv = document.createElement("div");
      bookDiv.classList.add("book");
  
      const coverUrl = book.attributes.Cover ? book.attributes.Cover.data.attributes.url : null; // get the cover image URL
  
      // use ternary operator to create the book info and cover image template string
      const bookInfoTemplate = `
        <h2>${book.attributes.Title}</h2>
        <p>Author: ${book.attributes.Author}</p>
        ${coverUrl ? `<img src="http://localhost:1338${coverUrl}" alt="Book cover">` : ''}
        <p>Pages: ${book.attributes.Pages}</p>
        <p>Published: ${book.attributes.Published}</p>
        <label for="rating-input-${book.id}">Rating:</label>
        <input type="number" id="rating-input-${book.id}" min="1" max="5" value="${book.attributes.Rating}">
        <button onclick="updateRating(${book.id})">Add Rate</button>
        <button onclick="addToFavorite(${book.id})">Add to favorites</button>
        <p id="rate-${book.id}">Your rating: ${book.attributes.Rating}</p>
      `;
  
      bookDiv.innerHTML = bookInfoTemplate;
  
      return bookDiv;
    } catch (error) {
      console.log(`Error creating book div: ${error}`);
      return null;
    }
  };

  const updateRating = async (bookId) => {
    const ratingInput = document.querySelector(`#rating-input-${bookId}`);
    const rating = parseInt(ratingInput.value);
  
    try {
      const response = await axios.put(`http://localhost:1338/api/books/${bookId}`, {
        data: {
          attributes: {
            Rating: rating
          }
        }
      });
  
      const rateElement = document.querySelector(`#rate-${bookId}`);
      rateElement.innerText = `Your rating: ${rating}`;
    } catch (error) {
      console.log(`Error updating rating for book ${bookId}: ${error}`);
    }
  };


  let getBookRating = async (bookId) => {
    try {
      let response = await axios.get(`http://localhost:1338/api/books/${bookId}`);
      let book = response.data;
      return book.data.attributes.Rate;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  
  
  let toggleButtonAndRating = (button, ratingDiv) => {
    if (sessionStorage.getItem("token")) {
      button.classList.remove("hidden");
      ratingDiv.classList.remove("hidden");
    } else {
      button.classList.add("hidden");
      ratingDiv.classList.add("hidden");
    }
  };
  
  const addToRates = async (bookId) => {
    const ratingSelect = document.getElementById(`rating-select-${bookId}`);
    const rating = ratingSelect.value;
    try {
      const response = await axios.post(
        `http://localhost:1338/rates`,
        {
          book: bookId,
          user: sessionStorage.getItem("userId"),
          rate: rating
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );
      // update the book rating on the page
      const bookDiv = document.getElementById(`book-${bookId}`);
      const rateElement = bookDiv.querySelector(`#rate-${bookId}`);
      const newRating = response.data.rate;
      rateElement.innerText = `Rating: ${newRating}`;
    } catch (error) {
      console.log(error);
    }
  };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


let favoriteBook = async (bookId) => {
  try {
    let response = await axios.put(
      `http://localhost:1338/api/books/${bookId}`,
      {
        data: {
          users: {
            connect: [sessionStorage.getItem("loginId")],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    let data = response.data;
  } catch (error) {
    console.log(error);
  }
};

let getFavoriteBooks = async () => {
  try {
    let response = await axios.get(
      `http://localhost:1338/api/books?filter[users]=${sessionStorage.getItem(
        "loginId"
      )}&populate=users`
    );
    let favoriteBooks = response.data;
    // Skapa en ny array med alla favoritböcker
    let favoriteBooksByUser = {};
    favoriteBooks.data.forEach((favoriteBook) => {
      let userId = favoriteBook.attributes.users.data[0].id;
      if (favoriteBooksByUser[userId]) {
        favoriteBooksByUser[userId].push(favoriteBook);
      } else {
        favoriteBooksByUser[userId] = [favoriteBook];
      }
    });
    return favoriteBooksByUser;
  } catch (error) {
    console.log(error);
    return null;
  }
};



let rateBook = async (bookId, rate) => {
  try {
    let response = await axios.post(
      `http://localhost:1338/api/rates`,
      {
        data: {
          rate: rate,
          books: {
            connect: [bookId],
          },
          users: {
            connect: [sessionStorage.getItem("loginId")],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    );
    response = await axios.get(
      `http://localhost:1338/api/rate?filter[books]=${bookId}&populate=books`
    );
    let userRatings = response.data;
    // Skapa en ny array med alla ratings för en bok
    let userRatingsByBook = {};
    userRatings.data.forEach((userRating) => {
      let bookId = userRating.attributes.books.data[0].id;
      if (!userRatingsByBook[bookId]) {
        userRatingsByBook[bookId] = [];
      }
      userRatingsByBook[bookId].push(userRating);
    });
    // Loopa igenom alla böcker
    for (const bookId in userRatingsByBook) {
      let totalRating = 0;

      // Loopa igenom alla användares ratings för en bok
      for (const userRating of userRatingsByBook[bookId]) {
        totalRating += userRating.attributes.rating;
      }
      const avgRating = Math.round(
        totalRating / userRatingsByBook[bookId].length
      );

      await axios.put(
        `http://localhost:1338/api/books/${bookId}`,
        {
          data: {
            rating: rating,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
};
