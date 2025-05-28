const MongoStore = require('connect-mongo');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const crypto = require('crypto');

const User = require('./models/user');
const { render } = require('ejs');
const user = require('./models/user');

const app = express();

// --- Configuration (No .env) ---
const MONGODB_URI = "mongodb+srv://bram83015:Srinivas1234@cluster0.ngixfji.mongodb.net/authsystem"; // <-- Replace with your actual URI
const SESSION_SECRET = crypto.randomBytes(64).toString('hex'); // Or a hardcoded string

// --- Connect to MongoDB ---
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  return res.redirect('/signin');
}

// --- Routes ---
app.get('/', (req, res) => req.session.user ? res.redirect('/dashboard') : res.redirect('/signin'));

app.get('/signin', (req, res) => {
  res.render('signin', {
    error: null,
    signupError: false,
    passwordErrors: [],
    name: '',
    email: '',
    mobile_number: '',
    gender: ''
  });
});
app.post('/Exercise/submit', isAuthenticated, async (req, res) => {
  try {
    const { htmlcode, csscode, jscode, moduleId } = req.body;
    const userId = req.session.user.id; // Always use session ID for security
    console.log("HTML:", req.body.htmlcode);
console.log("CSS:", req.body.csscode);
console.log("JS:", req.body.jscode);

    // Validate required fields
    console.log("inside exercise/submit");

    // Find user (using session ID, not body input)
    const user = await User.findById(userId);
    if (!user) {
      req.session.error = 'User not found';
      return res.redirect('/signin');
    }

    // Find or create module progress
    let module = user.modules.find(m => m.moduleId === moduleId);
    
    if (!module) {
      // Create new module entry if doesn't exist
      module = {
        moduleId,
        codes: { htmlcode, csscode, jscode },
        ModuleCompleted: "completed"
      };
      user.modules.push(module);
    } else {
      // Update existing module
      module.codes = { htmlcode, csscode, jscode };
      module.ModuleCompleted = "completed";
    }

    await user.save();

    // Set success message
    req.session.message = 'Exercise submitted successfully!';
    res.redirect('/dashboard');
  } catch (error) {
    console.error("Error in /exercise/submit:", error);
    req.session.error = 'An error occurred while submitting the exercise';
    
    // Safe redirect with fallback
    
  }
});




app.post("/Exercise/:moduleId", async (req, res) => {
  const moduleId = req.params.moduleId;

  const allModules = [
      {
        id: 'html-basics',
        name: 'The Web Awakens – Creating Your First HTML Page',
        description: 'Every adventure begins somewhere. This one begins with your first-ever HTML page. Let\'s put it together and start your journey on the web!',
        duration: '30 mins'
      },
      {
        id: 'css-styling',
        name: 'Speak Loud and Clear – Meet the Headings!',
        description: 'Headings are like signboards on the road. They help you organize your ideas and guide your readers. Time to try out headings from big to small.',
        duration: '30 mins'
      },
      {
        id: 'flexbox-layout',
        name: 'The Grocery Scroll – Unleashing Lists',
        description: 'It\'s time to organize your pantry and cooking steps using lists! You’ll use both unordered and ordered lists to do this.',
        duration: '40 mins'
      },
      {
        id: 'js-basics',
        name: 'Picture Perfect – Adding an Image',
        description: 'Images speak louder than text sometimes. Time to decorate your webpage with an image of your favorite thing!',
        duration: '40 mins'
      },
      {
        id: 'dom-manipulation',
        name: 'The Great Divide – Sections, Classes & Divs',
        description: 'Think of your webpage like rooms in a house. Sections and divs help organize each room.',
        duration: '50 mins'
      },
      {
        id: 'event-handling',
        name: 'What is CSS?',
        description: 'Imagine your website is a plain cake — CSS is the frosting and decorations that make it irresistible! CSS controls how your HTML looks, from colors and fonts to layouts and animations.',
        duration: '45 mins'
      },
      {
        id: 'api-integration',
        name: 'Styling Lists Like a Pro',
        description: 'Lists organize your content like a neat shelf. But plain bullet points are boring! Let’s spice them up with custom colors, spacing, and styles.',
        duration: '45 mins'
      },
      {
        id: 'form-validation',
        name: 'Perfect Your Navbar',
        description: 'Your navbar is your website’s compass. Let\'s style it so users can easily navigate while making it visually sleek.',
        duration: '45 mins'
      },
      {
        id: 'local-storage',
        name: 'Beautiful Sections with Classes and Divs',
        description: 'Websites are like stories broken into chapters. Sections and divs help organize content — now let\'s style them!',
        duration: '40 mins'
      },
      {
        id: 'final-project',
        name: 'Footer Fun',
        description: 'The footer is like the sign-off in a letter. Let’s make it look friendly and clear with simple styling.',
        duration: '60 mins'
      }
    ];

  try {
    if (!req.session.user) return res.redirect("/signin");

    const userId = req.session.user.id;
    const user = await User.findById(userId); // ✅ You need to load user from DB

    let userModule = user.modules.find(m => m.moduleId === moduleId);
    if (!userModule) {
      // Add module to user if not present
      userModule = {
        moduleId,
        ModuleCompleted: "started",
        codes: { htmlcode: "", csscode: "", jscode: "" }
      };
      user.modules.push(userModule);
      await user.save();
    }

    // Update session as well (optional)
    req.session.user.modules = user.modules;

    // Render exercise page
    const matchedModule = allModules.find(m => m.id === moduleId);
    res.redirect(`/Exercise/${moduleId}`);

  } catch (error) {
    console.error("Exercise start error:", error);
    res.status(500).send("Server error");
  }
});

app.get('/Exercise/:moduleId', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      req.session.error = 'User not found. Please sign in again.';
      return res.redirect('/signin');
    }

    const moduleId = req.params.moduleId;
    const allModules = [
      {
        id: 'html-basics',
        name: 'The Web Awakens – Creating Your First HTML Page',
        description: 'Every adventure begins somewhere. This one begins with your first-ever HTML page. Let\'s put it together and start your journey on the web!',
        duration: '30 mins'
      },
      {
        id: 'css-styling',
        name: 'Speak Loud and Clear – Meet the Headings!',
        description: 'Headings are like signboards on the road. They help you organize your ideas and guide your readers. Time to try out headings from big to small.',
        duration: '30 mins'
      },
      {
        id: 'flexbox-layout',
        name: 'The Grocery Scroll – Unleashing Lists',
        description: 'It\'s time to organize your pantry and cooking steps using lists! You’ll use both unordered and ordered lists to do this.',
        duration: '40 mins'
      },
      {
        id: 'js-basics',
        name: 'Picture Perfect – Adding an Image',
        description: 'Images speak louder than text sometimes. Time to decorate your webpage with an image of your favorite thing!',
        duration: '40 mins'
      },
      {
        id: 'dom-manipulation',
        name: 'The Great Divide – Sections, Classes & Divs',
        description: 'Think of your webpage like rooms in a house. Sections and divs help organize each room.',
        duration: '50 mins'
      },
      {
        id: 'event-handling',
        name: 'What is CSS?',
        description: 'Imagine your website is a plain cake — CSS is the frosting and decorations that make it irresistible! CSS controls how your HTML looks, from colors and fonts to layouts and animations.',
        duration: '45 mins'
      },
      {
        id: 'api-integration',
        name: 'Styling Lists Like a Pro',
        description: 'Lists organize your content like a neat shelf. But plain bullet points are boring! Let’s spice them up with custom colors, spacing, and styles.',
        duration: '45 mins'
      },
      {
        id: 'form-validation',
        name: 'Perfect Your Navbar',
        description: 'Your navbar is your website’s compass. Let\'s style it so users can easily navigate while making it visually sleek.',
        duration: '45 mins'
      },
      {
        id: 'local-storage',
        name: 'Beautiful Sections with Classes and Divs',
        description: 'Websites are like stories broken into chapters. Sections and divs help organize content — now let\'s style them!',
        duration: '40 mins'
      },
      {
        id: 'final-project',
        name: 'Footer Fun',
        description: 'The footer is like the sign-off in a letter. Let’s make it look friendly and clear with simple styling.',
        duration: '60 mins'
      }
    ];

    const currentModule = allModules.find(m => m.id === moduleId);
    if (!currentModule) {
      req.session.error = 'Module not found';
      return res.redirect('/dashboard');
    }

    let userModule = user.modules.find(m => m.moduleId === moduleId);
    console.log(userModule)
    if (!userModule) {
      userModule = {
        moduleId,
        ModuleCompleted: "started",
        codes: {
          htmlcode: "",
          csscode: "",
          jscode: ""
        }
      };
      user.modules.push(userModule);
      await user.save();
    }

    const userId = req.session.user.id;
    const ModuleCompleted = userModule.ModuleCompleted;

    res.render('Exercises', {
      modules: allModules,
      currentModule: currentModule,
      M_id: moduleId,
      userId: userId,
      codes: userModule.codes,
      htmlCode: userModule.codes.htmlcode,
      cssCode: userModule.codes.csscode,
      jsCode: userModule.codes.jscode,
      ModuleCompleted: ModuleCompleted
    });
  } catch (err) {
    console.error('Exercise page error:', err.stack);
    req.session.error = 'An error occurred while loading the exercise page';
    res.redirect('/dashboard');
  }
});



app.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const allModules = [
  {
    id: 'html-basics',
    name: 'The Web Awakens – Creating Your First HTML Page',
    description: 'Every adventure begins somewhere. This one begins with your first-ever HTML page. Let\'s put it together and start your journey on the web!',
    duration: '30 mins'
  },
  {
    id: 'css-styling',
    name: 'Speak Loud and Clear – Meet the Headings!',
    description: 'Headings are like signboards on the road. They help you organize your ideas and guide your readers. Time to try out headings from big to small.',
    duration: '30 mins'
  },
  {
    id: 'flexbox-layout',
    name: 'The Grocery Scroll – Unleashing Lists',
    description: 'It\'s time to organize your pantry and cooking steps using lists! You’ll use both unordered and ordered lists to do this.',
    duration: '40 mins'
  },
  {
    id: 'js-basics',
    name: 'Picture Perfect – Adding an Image',
    description: 'Images speak louder than text sometimes. Time to decorate your webpage with an image of your favorite thing!',
    duration: '40 mins'
  },
  {
    id: 'dom-manipulation',
    name: 'The Great Divide – Sections, Classes & Divs',
    description: 'Think of your webpage like rooms in a house. Sections and divs help organize each room.',
    duration: '50 mins'
  },
  {
    id: 'event-handling',
    name: 'What is CSS?',
    description: 'Imagine your website is a plain cake — CSS is the frosting and decorations that make it irresistible! CSS controls how your HTML looks, from colors and fonts to layouts and animations.',
    duration: '45 mins'
  },
  {
    id: 'api-integration',
    name: 'Styling Lists Like a Pro',
    description: 'Lists organize your content like a neat shelf. But plain bullet points are boring! Let’s spice them up with custom colors, spacing, and styles.',
    duration: '45 mins'
  },
  {
    id: 'form-validation',
    name: 'Perfect Your Navbar',
    description: 'Your navbar is your website’s compass. Let\'s style it so users can easily navigate while making it visually sleek.',
    duration: '45 mins'
  },
  {
    id: 'local-storage',
    name: 'Beautiful Sections with Classes and Divs',
    description: 'Websites are like stories broken into chapters. Sections and divs help organize content — now let\'s style them!',
    duration: '40 mins'
  },
  {
    id: 'final-project',
    name: 'Footer Fun',
    description: 'The footer is like the sign-off in a letter. Let’s make it look friendly and clear with simple styling.',
    duration: '60 mins'
  }
];



    const totalModules = allModules.length;
    const completedModules = user.modules.filter(m => m.ModuleCompleted === 'completed').length;
    const progressPercentage = Math.round((completedModules / totalModules) * 100);
    const remainingModules = totalModules - completedModules;

    const createdAt = new Date(user.createdAt);
    const today = new Date();
    const daysActive = Math.ceil((today - createdAt) / (1000 * 60 * 60 * 24));
    const streak = user.modules.some(m => m.ModuleCompleted === 'completed') ? 2 : 0;
    const userId = req.session.user.id
    // Extract error from query parameters
    const error = req.query.error || null;
    const message = req.query.message || null;
    req.session.allModules = allModules;
    
    res.render('dashboard', {
      userId,
      Username: user.name,
      email: user.email,
      createdAt: user.createdAt,
      progressPercentage,
      completedModules,
      remainingModules,
      daysActive,
      allModules,
      streak,
      error,    // Pass error to the template
      message,  // Pass message to the template
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).send('Server error');
  }
});



app.get('/profile', isAuthenticated, (req, res) => {
  const createdAt = req.session.user.createdAt;
  const dateObj = new Date(createdAt);
  const dateOnly = dateObj.toISOString().split("T")[0];
  const error = req.query.error || null;
  const message = req.query.message || null;
  const bio = req.session.user.bio
  res.render('profile', {
    Username: req.session.user.name,
    Email: req.session.user.email,
    MN: req.session.user.mobile_number,
    createdAt: dateOnly,
    bio,
    error,
    message,
  });
  console.log("Session:", req.session);
  console.log("In Profile",req.session)

});
app.post('/profile/Bioupdate', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { bio } = req.body;

    if (!bio || bio.trim().length === 0) {
      return res.redirect('/profile?error=Bio%20cannot%20be%20empty');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/profile?error=User%20not%20found');
    }

    user.bio = bio.trim();
    await user.save();

    // Update session
    req.session.user.bio = user.bio;

    const dateOnly = user.createdAt.toISOString().split('T')[0];
    const message = 'Bio updated successfully';
    const error = null;

    res.render('profile', {
      Username: req.session.user.name,
      Email: req.session.user.email,
      MN: req.session.user.mobile_number,
      createdAt: dateOnly,
      bio: user.bio,
      error,
      message,

    });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.redirect('/profile?error=Server%20error');
  }
});

app.post("/Exercise/saveProgress", async (req, res) => {
  try {
    const { htmlcode, csscode, jscode, moduleId } = req.body;
    const userId = req.session.user.id; // Always use session ID for security
    console.log("HTML:", req.body.htmlcode);
console.log("CSS:", req.body.csscode);
console.log("JS:", req.body.jscode);

    // Validate required fields
    console.log("inside exercise/saveprogress");

    // Find user (using session ID, not body input)
    const user = await User.findById(userId);
    if (!user) {
      req.session.error = 'User not found';
      return res.redirect('/signin');
    }

    // Find or create module progress
    let module = user.modules.find(m => m.moduleId === moduleId);
    
    if (!module) {
      // Create new module entry if doesn't exist
      module = {
        moduleId,
        codes: { htmlcode, csscode, jscode },
        ModuleCompleted: "completed"
      };
      user.modules.push(module);
    } else {
      // Update existing module
      module.codes = { htmlcode, csscode, jscode };
      module.ModuleCompleted = "completed";
    }

    await user.save();

    // Set success message
    req.session.message = 'Exercise submitted successfully!';
    res.redirect('/dashboard');
  } catch (error) {
    console.error("Error in /exercise/submit:", error);
    req.session.error = 'An error occurred while submitting the exercise';
    
    // Safe redirect with fallback
    
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send("Logout error");
    res.redirect('/signin');
  });
});

app.post('/signup', async (req, res) => {
  const { name, email, password, confirm_password, gender, mobile_number } = req.body;

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*_-])[A-Za-z\d!@#$%^&*_-]{8,}$/;
  const phoneRegex = /^\d{10}$/;
  const passwordErrors = [];

  if (!passwordRegex.test(password)) {
    if (password.length < 8) passwordErrors.push("Password must be at least 8 characters");
    if (!/[a-z]/.test(password)) passwordErrors.push("Must contain at least 1 lowercase letter");
    if (!/[A-Z]/.test(password)) passwordErrors.push("Must contain at least 1 uppercase letter");
    if (!/\d/.test(password)) passwordErrors.push("Must contain at least 1 number");
    if (!/[!@#$%^&*_-]/.test(password)) passwordErrors.push("Must contain at least 1 special character");
  }

  if (password !== confirm_password) passwordErrors.push("Passwords do not match");
  if (!phoneRegex.test(mobile_number)) passwordErrors.push("Mobile number must be 10 digits");

  if (passwordErrors.length > 0) {
    return res.render("signin", {
      error: null,
      signupError: true,
      passwordErrors,
      name,
      email,
      mobile_number,
      gender
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signin", {
        error: "Email already exists",
        signupError: true,
        passwordErrors: [],
        name,
        email,
        mobile_number,
        gender
      });
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10);
const allModules = [
  {
    id: 'html-basics',
    name: 'The Web Awakens – Creating Your First HTML Page',
    description: 'Every adventure begins somewhere. This one begins with your first-ever HTML page. Let\'s put it together and start your journey on the web!',
    duration: '30 mins'
  },
  {
    id: 'css-styling',
    name: 'Speak Loud and Clear – Meet the Headings!',
    description: 'Headings are like signboards on the road. They help you organize your ideas and guide your readers. Time to try out headings from big to small.',
    duration: '30 mins'
  },
  {
    id: 'flexbox-layout',
    name: 'The Grocery Scroll – Unleashing Lists',
    description: 'It\'s time to organize your pantry and cooking steps using lists! You’ll use both unordered and ordered lists to do this.',
    duration: '40 mins'
  },
  {
    id: 'js-basics',
    name: 'Picture Perfect – Adding an Image',
    description: 'Images speak louder than text sometimes. Time to decorate your webpage with an image of your favorite thing!',
    duration: '40 mins'
  },
  {
    id: 'dom-manipulation',
    name: 'The Great Divide – Sections, Classes & Divs',
    description: 'Think of your webpage like rooms in a house. Sections and divs help organize each room.',
    duration: '50 mins'
  },
  {
    id: 'event-handling',
    name: 'What is CSS?',
    description: 'Imagine your website is a plain cake — CSS is the frosting and decorations that make it irresistible! CSS controls how your HTML looks, from colors and fonts to layouts and animations.',
    duration: '45 mins'
  },
  {
    id: 'api-integration',
    name: 'Styling Lists Like a Pro',
    description: 'Lists organize your content like a neat shelf. But plain bullet points are boring! Let’s spice them up with custom colors, spacing, and styles.',
    duration: '45 mins'
  },
  {
    id: 'form-validation',
    name: 'Perfect Your Navbar',
    description: 'Your navbar is your website’s compass. Let\'s style it so users can easily navigate while making it visually sleek.',
    duration: '45 mins'
  },
  {
    id: 'local-storage',
    name: 'Beautiful Sections with Classes and Divs',
    description: 'Websites are like stories broken into chapters. Sections and divs help organize content — now let\'s style them!',
    duration: '40 mins'
  },
  {
    id: 'final-project',
    name: 'Footer Fun',
    description: 'The footer is like the sign-off in a letter. Let’s make it look friendly and clear with simple styling.',
    duration: '60 mins'
  }
];
const modules = allModules.map(m => ({
  moduleId: m.id,
  ModuleCompleted: "not started",
  codes: {
    htmlcode: '',
    csscode: '',
    jscode: ''
  }
}));
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      gender,
      mobile_number,
      modules,
    });

    await newUser.save();

  req.session.user = {
  id: newUser._id.toString(),
  name: newUser.name,
  email: newUser.email,
  mobile_number: newUser.mobile_number,
  createdAt: newUser.createdAt,
  bio: newUser.bio || "",
  modules: newUser.modules 
};

       

  

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Signup error:", err.stack);
    res.render("signin", {
      error: "Server error: " + err.message,
      signupError: true,
      passwordErrors: [],
      name,
      email,
      mobile_number,
      gender
    });
  }
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = email?.trim() || '';
  const trimmedPassword = password?.trim() || '';

  try {
    const user = await User.findOne({ email: trimmedEmail });
    // If old user doesn't have modules, initialize them
if (!user.modules || user.modules.length === 0) {
  const allModules = [
    { id: 'html-basics' },
    { id: 'css-styling' },
    { id: 'flexbox-layout' },
    { id: 'js-basics' },
    { id: 'dom-manipulation' },
    { id: 'event-handling' },
    { id: 'api-integration' },
    { id: 'form-validation' },
    { id: 'local-storage' },
    { id: 'final-project' }
  ];

  user.modules = allModules.map(m => ({
    moduleId: m.id,
    ModuleCompleted: "not started",
    codes: {
      htmlcode: '',
      csscode: '',
      jscode: ''
    }
  }));

  await user.save();
}

  if (!user || !await bcrypt.compare(trimmedPassword, user.password)) {
    return res.render("signin", {
      error: "Invalid email or password",
      signupError: false,
      passwordErrors: [],
      name: '', email: '', mobile_number: '', gender: ''
    });
  
    }
    console.log("User Password",user.password);
    console.log("my Password",password)
    console.log("Raw req.body:", req.body);
console.log("Trimmed email:", req.body.email?.trim());
console.log("Trimmed password:", req.body.password?.trim());


    const isMatch = await bcrypt.compare(password?.trim(), user.password);
    if (!isMatch) {
      return res.render("signin", {
        error: "Invalid email or password",
        signupError: false,
        passwordErrors: [],
        name: '', email: '', mobile_number: '', gender: ''
      });
    }

    req.session.user = {
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  mobile_number: user.mobile_number,
  createdAt: user.createdAt,
  bio: user.bio,
  modules: user.modules,
};

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Signin error:", error.stack);
    res.render("signin", {
      error: "Server error: " + error.message,
      signupError: false,
      passwordErrors: [],
      name: '', email: '', mobile_number: '', gender: ''
    });
  }
});

app.get('/Exercises', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const moduleId = req.query.moduleId;

    if (!moduleId || typeof moduleId !== 'string' || moduleId.trim() === '') {
      return res.redirect('/dashboard?error=Module%20ID%20is%20required');
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect('/dashboard?error=User%20not%20found');
    }

    const allModules = [
      { id: 'html-basics', name: 'HTML Basics' },
      { id: 'css-styling', name: 'CSS Styling' },
      { id: 'flexbox-layout', name: 'Flexbox Layout' },
      { id: 'js-basics', name: 'JavaScript Basics' },
      { id: 'dom-manipulation', name: 'DOM Manipulation' },
      { id: 'event-handling', name: 'Event Handling' },
      { id: 'api-integration', name: 'API Integration' },
      { id: 'form-validation', name: 'Form Validation' },
      { id: 'local-storage', name: 'Local Storage' },
      { id: 'final-project', name: 'Final Project' },
    ];
    const moduleOrder = allModules.map(m => m.id);
    if (!moduleOrder.includes(moduleId)) {
      return res.redirect('/dashboard?error=Invalid%20module%20ID');
    }

    const currentIndex = moduleOrder.indexOf(moduleId);
    let isLocked = false;
    if (currentIndex > 0) {
      const prevModule = user.modules.find(m => m.moduleId === moduleOrder[currentIndex - 1]);
      isLocked = !prevModule || prevModule.status !== 'Completed';
    }

    if (isLocked) {
      return res.redirect('/dashboard?error=Please%20complete%20the%20previous%20module%20first');
    }

    let module = user.modules.find(m => m.moduleId === moduleId);
    if (!module) {
      user.modules.push({ moduleId, status: 'In Progress' });
      await user.save();
    } else if (module.status === 'Not Started') {
      module.status = 'In Progress';
      await user.save();
    }

    const moduleInfo = allModules.find(m => m.id === moduleId);
    const moduleName = moduleInfo ? moduleInfo.name : 'Unknown Module';

    res.render('Exercises', { userId, moduleId, moduleName });
  } catch (error) {
    console.error('Error loading exercise:', error);
    res.redirect('/dashboard?error=Server%20error');
  }
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("signin", {
    error: "Something went wrong on the server.",
    signupError: false,
    passwordErrors: [],
    name: '',
    email: '',
    mobile_number: '',
    gender: ''
  });
});

// --- Export for Serverless ---


// --- Local server start ---
if (require.main === module) {
  const PORT = 5000;
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}
